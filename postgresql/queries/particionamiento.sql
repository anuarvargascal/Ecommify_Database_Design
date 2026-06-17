-- ============================================================================
-- Estrategia de particionamiento para orders
-- Tabla seleccionada: orders
-- Columna de particion: order_purchase_timestamp
-- Tipo: RANGE mensual con particion DEFAULT
-- Uso: laboratorio/validacion de rendimiento frente a tabla no particionada.
-- ============================================================================

SET search_path TO ecommerce2;

-- 1. Tabla particionada de validacion.
-- Nota arquitectonica:
-- En PostgreSQL, una restriccion UNIQUE/PRIMARY KEY sobre una tabla particionada
-- debe incluir las columnas de particion. Por eso, para este escenario de
-- validacion, se define PK compuesta (order_id, order_purchase_timestamp)
-- y se conserva un indice no unico por order_id para consultas y joins.

DROP TABLE IF EXISTS orders_part CASCADE;

CREATE TABLE orders_part (
    order_id                         CHAR(32) NOT NULL,
    customer_id                      CHAR(32) NOT NULL,
    order_status                     VARCHAR(30) NOT NULL,
    order_purchase_timestamp         TIMESTAMP NOT NULL,
    order_approved_at                TIMESTAMP,
    order_delivered_carrier_date     TIMESTAMP,
    order_delivered_customer_date    TIMESTAMP,
    order_estimated_delivery_date    TIMESTAMP NOT NULL,
    CONSTRAINT pk_orders_part PRIMARY KEY (order_id, order_purchase_timestamp),
    CONSTRAINT fk_orders_part_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT ck_orders_part_status
        CHECK (order_status IN ('created','approved','invoiced','processing','shipped','delivered','unavailable','canceled'))
)
PARTITION BY RANGE (order_purchase_timestamp);

-- 2. Creacion automatica de particiones mensuales.
CREATE OR REPLACE FUNCTION create_orders_part_month(p_start DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    p_end DATE := (p_start + INTERVAL '1 month')::date;
    p_name TEXT := 'orders_part_' || to_char(p_start, 'YYYY_MM');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS ecommerce2.%I PARTITION OF ecommerce2.orders_part FOR VALUES FROM (%L) TO (%L);',
        p_name, p_start, p_end
    );
END;
$$;

-- 3. Particiones historicas: datos observados entre 2016-09 y 2018-10.
DO $$
DECLARE
    d DATE := DATE '2016-09-01';
BEGIN
    WHILE d < DATE '2018-11-01' LOOP
        PERFORM create_orders_part_month(d);
        d := (d + INTERVAL '1 month')::date;
    END LOOP;
END $$;

-- 4. Particion DEFAULT para valores fuera de rango o cargas futuras no previstas.
CREATE TABLE IF NOT EXISTS orders_part_default
PARTITION OF orders_part DEFAULT;

-- 5. Indices sobre la tabla particionada.
-- PostgreSQL crea/adjunta indices equivalentes en las particiones.
CREATE INDEX IF NOT EXISTS idx_orders_part_order_id
ON orders_part (order_id);

CREATE INDEX IF NOT EXISTS idx_orders_part_customer
ON orders_part (customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_part_purchase_ts
ON ecommerce2.orders_part (order_purchase_timestamp);

CREATE INDEX IF NOT EXISTS idx_orders_part_status_purchase_ts
ON ecommerce2.orders_part (order_status, order_purchase_timestamp);

CREATE INDEX IF NOT EXISTS idx_orders_part_delivery_sla
ON ecommerce2.orders_part (order_status, order_estimated_delivery_date, order_delivered_customer_date);

-- 6. Carga de datos .
INSERT INTO ecommerce2.orders_part (
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date
)
SELECT
    order_id,
    customer_id,
    order_status,
    order_purchase_timestamp,
    order_approved_at,
    order_delivered_carrier_date,
    order_delivered_customer_date,
    order_estimated_delivery_date
FROM ecommerce2.orders;

ANALYZE ecommerce2.orders_part;

-- 7. Validacion de distribucion de filas por particion.
SELECT
    tableoid::regclass AS partition_name,
    COUNT(*) AS rows
FROM ecommerce2.orders_part
GROUP BY 1
ORDER BY 1;

-- 8. Comparacion de rendimiento: escenario sin particionamiento.
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    DATE_TRUNC('month', o.order_purchase_timestamp)::date AS month,
    o.order_status,
    COUNT(DISTINCT o.order_id) AS orders
FROM ecommerce2.orders o
WHERE o.order_purchase_timestamp >= DATE '2018-01-01'
  AND o.order_purchase_timestamp <  DATE '2019-01-01'
  AND o.order_status IN ('delivered', 'shipped')
GROUP BY 1, 2
ORDER BY 1, 2;

-- 9. Comparacion de rendimiento: escenario particionado.
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    DATE_TRUNC('month', o.order_purchase_timestamp)::date AS month,
    o.order_status,
    COUNT(DISTINCT o.order_id) AS orders
FROM ecommerce2.orders_part o
WHERE o.order_purchase_timestamp >= DATE '2018-01-01'
  AND o.order_purchase_timestamp <  DATE '2019-01-01'
  AND o.order_status IN ('delivered', 'shipped')
GROUP BY 1, 2
ORDER BY 1, 2;

-- 10. Prueba de pruning a un solo mes.
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    o.order_id,
    o.order_status,
    o.order_purchase_timestamp,
    o.order_estimated_delivery_date
FROM ecommerce2.orders_part o
WHERE o.order_purchase_timestamp >= TIMESTAMP '2018-06-01'
  AND o.order_purchase_timestamp <  TIMESTAMP '2018-07-01'
  AND o.order_status = 'delivered'
ORDER BY o.order_purchase_timestamp;

-- 11. Control de particion DEFAULT.
SELECT COUNT(*) AS rows_in_default
FROM ecommerce2.orders_part_default;
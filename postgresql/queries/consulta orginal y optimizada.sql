
-- 1. Consulta id.14 Ranking de ventas por estado y ciudad del cliente.  
--Consulta original
--Ventas por estado y ciudad del cliente.
SELECT
    gz.state,
    gz.city,
    COUNT(DISTINCT o.order_id) AS orders,
    COUNT(oi.order_item_id) AS items,
    SUM(oi.price) AS gross_product_revenue,
    SUM(oi.freight_value) AS freight_revenue
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN dim_geolocation_zip gz ON gz.zip_code_prefix = c.customer_zip_code_prefix
JOIN order_items oi ON oi.order_id = o.order_id
GROUP BY gz.state, gz.city
ORDER BY gross_product_revenue DESC
LIMIT 100;


--Consulta 1 optimizada

WITH order_item_totals AS (
    SELECT
        order_id,
        COUNT(order_item_id) AS items,
        SUM(price) AS gross_product_revenue,
        SUM(freight_value) AS freight_revenue
    FROM order_items
    GROUP BY order_id
)
SELECT
    gz.state,
    gz.city,
    COUNT(o.order_id) AS orders,
    SUM(oit.items) AS items,
    SUM(oit.gross_product_revenue) AS gross_product_revenue,
    SUM(oit.freight_revenue) AS freight_revenue
FROM orders o
JOIN customers c
    ON c.customer_id = o.customer_id
JOIN dim_geolocation_zip gz
    ON gz.zip_code_prefix = c.customer_zip_code_prefix
JOIN order_item_totals oit
    ON oit.order_id = o.order_id
GROUP BY gz.state, gz.city
ORDER BY gross_product_revenue DESC
LIMIT 100;

--2. Consulta id.5 Consulta de reseñas negativas con contenido y detalle de orden, cliente, ítems y productos 
--Consulta original

SET search_path TO ecommerce;
 EXPLAIN ANALYZE
SELECT
    rv.review_id,
    rv.order_id,
    rv.review_score,
    rv.review_content ->> 'message' AS review_message,
    o.order_status,
    o.order_purchase_timestamp,
    c.customer_unique_id,
    p.product_id,
    p.product_category_name
FROM order_reviews rv
JOIN orders o
    ON o.order_id = rv.order_id
JOIN customers c
    ON c.customer_id = o.customer_id
LEFT JOIN order_items oi
    ON oi.order_id = o.order_id
LEFT JOIN products p
    ON p.product_id = oi.product_id
WHERE rv.review_score <= 2
  AND rv.review_content ? 'message'
ORDER BY rv.review_score ASC, o.order_purchase_timestamp DESC;

Consulta optimizada

CREATE INDEX IF NOT EXISTS idx_reviews_low_score_message_order
ON order_reviews (review_score, order_id)
WHERE review_content ? 'message';

WITH filtered_reviews AS MATERIALIZED (
    SELECT
        review_id,
        order_id,
        review_score,
        review_content
    FROM order_reviews
    WHERE review_score <= 2
      AND review_content ? 'message'
)
SELECT
    rv.review_id,
    rv.order_id,
    rv.review_score,
    rv.review_content ->> 'message' AS review_message,
    o.order_status,
    o.order_purchase_timestamp,
    c.customer_unique_id,
    p.product_id,
    p.product_category_name
FROM filtered_reviews rv
JOIN orders o
    ON o.order_id = rv.order_id
JOIN customers c
    ON c.customer_id = o.customer_id
LEFT JOIN order_items oi
    ON oi.order_id = o.order_id
LEFT JOIN products p
    ON p.product_id = oi.product_id
ORDER BY rv.review_score ASC, o.order_purchase_timestamp DESC;

--3. Consulta id.10 Analizar reseñas negativas o medias por estado del cliente y categoría de producto en una ventana temporal 

--Consulta original
SET search_path TO ecommerce;
 EXPLAIN ANALYZE
SELECT
    gz.state AS customer_state,
    COALESCE(pc.product_category_name_english, p.product_category_name, 'without_category') AS category,
    COUNT(DISTINCT rv.review_id) AS reviews,
    COUNT(DISTINCT o.order_id) AS orders,
    ROUND(AVG(rv.review_score), 2) AS avg_review_score,
    MIN(lower(rv.review_response_period)) AS first_review_creation,
    MAX(upper(rv.review_response_period)) AS last_review_answer
FROM order_reviews rv
JOIN orders o
    ON o.order_id = rv.order_id
JOIN customers c
    ON c.customer_id = o.customer_id
JOIN dim_geolocation_zip gz
    ON gz.zip_code_prefix = c.customer_zip_code_prefix
JOIN Order_items oi
    ON oi.order_id = o.order_id
JOIN products p
    ON p.product_id = oi.product_id
LEFT JOIN product_categories pc
    ON pc.product_category_name = p.product_category_name
WHERE rv.review_response_period && tstzrange(
        '2018-03-01 00:00:00-03'::timestamptz,
        '2018-06-01 00:00:00-03'::timestamptz,
        '[)'
      )
  AND rv.review_score <= 3
GROUP BY gz.state, category
ORDER BY reviews DESC, avg_review_score ASC;

--Consulta optimizada

-- Índice recomendado para alinear el filtro de rango con reseñas de baja calificación
CREATE INDEX IF NOT EXISTS idx_order_reviews_period_low_score_gist
ON order_reviews
USING GIST (review_response_period)
WHERE review_score <= 3;

EXPLAIN (ANALYZE, BUFFERS)
-- Reescritura sugerida con preagregación para reducir duplicados por ítems
WITH filtered_reviews AS (
    SELECT review_id, order_id, review_score, review_response_period
    FROM order_reviews
    WHERE review_score <= 3
      AND review_response_period && tstzrange(
          '2018-03-01 00:00:00-03'::timestamptz,
          '2018-06-01 00:00:00-03'::timestamptz,
          '[)'
      )
), order_categories AS (
    SELECT
        oi.order_id,
        COALESCE(pc.product_category_name_english, p.product_category_name, 'without_category') AS category
    FROM order_items oi
    JOIN products p ON p.product_id = oi.product_id
    LEFT JOIN product_categories pc ON pc.product_category_name = p.product_category_name
    GROUP BY oi.order_id, category
)
SELECT
    gz.state AS customer_state,
    oc.category,
    COUNT(DISTINCT fr.review_id) AS reviews,
    COUNT(DISTINCT o.order_id) AS orders,
    ROUND(AVG(fr.review_score), 2) AS avg_review_score,
    MIN(lower(fr.review_response_period)) AS first_review_creation,
    MAX(upper(fr.review_response_period)) AS last_review_answer
FROM filtered_reviews fr
JOIN orders o ON o.order_id = fr.order_id
JOIN customers c ON c.customer_id = o.customer_id
JOIN dim_geolocation_zip gz ON gz.zip_code_prefix = c.customer_zip_code_prefix
JOIN order_categories oc ON oc.order_id = o.order_id
GROUP BY gz.state, oc.category
ORDER BY reviews DESC, avg_review_score ASC;

--4. Consulta id.12 Consulta para Identificar productos con peso superior a 5.000 

--Consulta original
--12 Filtros por especificaciones JSONB de producto.
SELECT
    p.product_id,
    COALESCE(pc.product_category_name_english, p.product_category_name, 'without_category') AS category,
    (p.product_specifications ->> 'product_weight_g')::numeric AS weight_g,
    (p.product_specifications ->> 'product_length_cm')::numeric AS length_cm,
    (p.product_specifications ->> 'product_height_cm')::numeric AS height_cm,
    (p.product_specifications ->> 'product_width_cm')::numeric AS width_cm
FROM products p
LEFT JOIN product_categories pc ON pc.product_category_name = p.product_category_name
WHERE p.product_specifications ? 'product_weight_g'
  AND (p.product_specifications ->> 'product_weight_g')::numeric > 5000
ORDER BY weight_g DESC
LIMIT 100;
Consulta optimizada

-- Índice funcional parcial recomendado para filtrar y ordenar por peso.
CREATE INDEX IF NOT EXISTS idx_products_weight_g_numeric_desc
ON products (((product_specifications ->> 'product_weight_g')::numeric) DESC)
WHERE product_specifications ? 'product_weight_g';

-- Validación recomendada después de crear índices o modificar estadísticas.
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    p.product_id,
    COALESCE(pc.product_category_name_english, p.product_category_name, 'without_category') AS category,
    (p.product_specifications ->> 'product_weight_g')::numeric AS weight_g,
    (p.product_specifications ->> 'product_length_cm')::numeric AS length_cm,
    (p.product_specifications ->> 'product_height_cm')::numeric AS height_cm,
    (p.product_specifications ->> 'product_width_cm')::numeric AS width_cm
FROM products p
LEFT JOIN product_categories pc
    ON pc.product_category_name = p.product_category_name
WHERE p.product_specifications ? 'product_weight_g'
  AND (p.product_specifications ->> 'product_weight_g')::numeric > 5000
ORDER BY weight_g DESC
LIMIT 100;

--5. Consulta id.7 Analizar registros de pago por tipo y número de cuotas, contando registros, órdenes únicas, valor total y promedio.

--Consulta original

-- 7 Análisis de pagos por tipo y cuotas.
SELECT
    payment_type,
    payment_installments,
    COUNT(*) AS payment_records,
    COUNT(DISTINCT order_id) AS orders,
    SUM(payment_value) AS payment_value,
    ROUND(AVG(payment_value), 2) AS avg_payment_value
FROM order_payments
GROUP BY payment_type, payment_installments
ORDER BY payment_value DESC;

--Consulta optimizada

--Índice recomendado para el patrón GROUP BY + COUNT(DISTINCT order_id).
CREATE INDEX IF NOT EXISTS idx_order_payments_type_installments_order_inc
ON order_payments (payment_type, payment_installments, order_id)
INCLUDE (payment_value);

EXPLAIN (ANALYZE, BUFFERS)
WITH payments_by_order AS (
    SELECT
    payment_type,
    payment_installments,
    order_id,
    COUNT(*) AS payment_records,
    SUM(payment_value) AS order_payment_value
    FROM order_payments
    GROUP BY
    payment_type,
    payment_installments,
    order_id
    )
SELECT
payment_type,
payment_installments,
SUM(payment_records) AS payment_records,
COUNT(*) AS orders,
SUM(order_payment_value) AS payment_value,
ROUND(
SUM(order_payment_value) / NULLIF(SUM(payment_records), 0),
2
) AS avg_payment_value
FROM payments_by_order
GROUP BY
payment_type,
payment_installments
ORDER BY
payment_value DESC;

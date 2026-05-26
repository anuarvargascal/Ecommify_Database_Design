-- ============================================================================
-- Script SQL consolidado preliminar - Ecommify/Olist
-- Incluye: modelo fisico 3FN, tipos avanzados PostgreSQL y extensiones.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS ecommerce;
SET search_path TO ecommerce;

-- --------------------------------------------------------------------------
--Habilitacion de extensiones
-- --------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS btree_gist;


CREATE TABLE dim_geolocation_zip (
    zip_code_prefix           INTEGER PRIMARY KEY,
    city                      CITEXT;
    state                     CHAR(2) NOT NULL,
    geom                      geometry(Point, 4326),
    geog                      geography(Point, 4326);

);

CREATE TABLE customers (
    customer_id               CHAR(32) PRIMARY KEY,
    customer_unique_id        CHAR(32) NOT NULL,
    customer_zip_code_prefix  INTEGER,
    CONSTRAINT fk_customer_zip
        FOREIGN KEY (customer_zip_code_prefix)
        REFERENCES dim_geolocation_zip(zip_code_prefix)
);

CREATE TABLE sellers (
    seller_id                 CHAR(32) PRIMARY KEY,
    seller_zip_code_prefix    INTEGER,
    CONSTRAINT fk_seller_zip
        FOREIGN KEY (seller_zip_code_prefix)
        REFERENCES dim_geolocation_zip(zip_code_prefix)
);

CREATE TABLE product_categories (
    product_category_name             VARCHAR(100) PRIMARY KEY,
    product_category_name_english     VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id                    CHAR(32) PRIMARY KEY,
    product_category_name         VARCHAR(100),
    product_specifications        JSONB,
    CONSTRAINT fk_product_category
        FOREIGN KEY (product_category_name)
        REFERENCES product_categories(product_category_name)
);

COMMENT ON COLUMN products.product_specifications IS
'Especificaciones semiestructuradas del producto: atributos descriptivos, dimensiones.';

CREATE TABLE orders (
    order_id                         CHAR(32) PRIMARY KEY,
    customer_id                      CHAR(32) NOT NULL,
    order_status                     VARCHAR(30) NOT NULL,
    order_purchase_timestamp         TIMESTAMP NOT NULL,
    order_approved_at                TIMESTAMP,
    order_delivered_carrier_date     TIMESTAMP,
    order_delivered_customer_date    TIMESTAMP,
    order_estimated_delivery_date    TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT ck_order_status
        CHECK (order_status IN ('created','approved','invoiced','processing','shipped','delivered','unavailable','canceled'))
);

CREATE TABLE order_items (
    order_id               CHAR(32) NOT NULL,
    order_item_id          INTEGER NOT NULL,
    product_id             CHAR(32) NOT NULL,
    seller_id              CHAR(32) NOT NULL,
    shipping_limit_date    TIMESTAMP NOT NULL,
    price                  NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    freight_value          NUMERIC(12,2) NOT NULL CHECK (freight_value >= 0),
    PRIMARY KEY (order_id, order_item_id),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_item_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

CREATE TABLE order_payments (
    order_id                 CHAR(32) NOT NULL,
    payment_sequential        INTEGER NOT NULL,
    payment_type              VARCHAR(30) NOT NULL,
    payment_installments      INTEGER NOT NULL CHECK (payment_installments >= 0),
    payment_value             NUMERIC(12,2) NOT NULL CHECK (payment_value >= 0),
    PRIMARY KEY (order_id, payment_sequential),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT ck_payment_type CHECK (payment_type IN ('credit_card','boleto','voucher','debit_card','not_defined'))
);

CREATE TABLE order_reviews (
    review_key                 BIGSERIAL PRIMARY KEY,
    review_id                  CHAR(32) NOT NULL,
    order_id                   CHAR(32) NOT NULL,
    review_score               SMALLINT NOT NULL CHECK (review_score BETWEEN 1 AND 5),
    review_content             JSONB,
    review_response_period     TSTZRANGE,
    CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT uq_review_order UNIQUE (review_id, order_id)
);

COMMENT ON COLUMN order_reviews.review_content IS
'Contenido enriquecido de la resena en JSONB: titulo, mensaje. ';

COMMENT ON COLUMN order_reviews.review_response_period IS
'Intervalo temporal entre la creacion de la resena y la respuesta, modelado con TSTZRANGE.';

-- Índices iniciales.
CREATE INDEX idx_customers_unique_id ON customers(customer_unique_id);
CREATE INDEX idx_customers_zip ON customers(customer_zip_code_prefix);
CREATE INDEX idx_sellers_zip ON sellers(seller_zip_code_prefix);
CREATE INDEX idx_products_category ON products(product_category_name);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_purchase_ts ON orders(order_purchase_timestamp);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);
CREATE INDEX idx_order_payments_type ON order_payments(payment_type);
CREATE INDEX idx_order_reviews_order ON order_reviews(order_id);
CREATE INDEX idx_order_reviews_score ON order_reviews(review_score);
CREATE INDEX idx_geo_state_city ON dim_geolocation_zip(state, city);

-- ============================================================================
--Indices especializados
-- ============================================================================

-- JSONB y arreglos usan GIN para busqueda por contencion.
CREATE INDEX IF NOT EXISTS idx_products_specifications_gin
ON products USING GIN (product_specifications);

CREATE INDEX IF NOT EXISTS idx_order_reviews_content_gin
ON order_reviews USING GIN (review_content);

CREATE INDEX IF NOT EXISTS idx_order_reviews_response_period_gist
ON order_reviews USING GIST (review_response_period);

-- --------------------------------------------------------------------------
--Funciones de normalizacion textual y seudonimizacion
-- --------------------------------------------------------------------------
-- Nota: se declara IMMUTABLE para permitir indices funcionales. Debe mantenerse
-- estable el diccionario de unaccent.rules en el ambiente donde se ejecute.
CREATE OR REPLACE FUNCTION ecommerce.normalize_text(input_text TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
RETURNS NULL ON NULL INPUT
AS $$
    SELECT lower(public.unaccent(input_text));
$$;

CREATE OR REPLACE FUNCTION ecommerce.sha256_text(input_text TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT encode(digest(coalesce(input_text, ''), 'sha256'), 'hex');
$$;

COMMENT ON FUNCTION ecommerce.normalize_text(TEXT) IS
'Normaliza texto a minusculas y sin acentos para busqueda tolerante a errores con pg_trgm y unaccent.';

COMMENT ON FUNCTION ecommerce.sha256_text(TEXT) IS
'Genera hash SHA-256 hexadecimal para seudonimizacion y control de integridad usando pgcrypto.';


-- --------------------------------------------------------------------------
--PostGIS aplicado a geolocalizacion
-- --------------------------------------------------------------------------
-- El modelo fisico consolidado usa dim_geolocation_zip con latitud/longitud
-- promedio por prefijo postal. Se adicionan columnas espaciales:
-- - geom: geometry(Point,4326), util para mapas y operaciones geométricas.
-- - geog: geography(Point,4326), util para distancias reales en metros.

CREATE INDEX IF NOT EXISTS idx_dim_geolocation_zip_geom_gist
ON dim_geolocation_zip USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_dim_geolocation_zip_geog_gist
ON dim_geolocation_zip USING GIST (geog);

-- --------------------------------------------------------------------------
--pg_trgm + unaccent: busqueda tolerante a errores y acentos
-- --------------------------------------------------------------------------
-- Se crean indices funcionales GIN para categorias, ciudades.

CREATE INDEX IF NOT EXISTS idx_product_categories_trgm_search
ON product_categories USING GIN (
    ecommerce.normalize_text(
        coalesce(product_category_name, '') || ' ' || coalesce(product_category_name_english, '')
    ) gin_trgm_ops
);

CREATE INDEX IF NOT EXISTS idx_dim_geolocation_city_trgm_search
ON dim_geolocation_zip USING GIN (
    ecommerce.normalize_text(coalesce(city, '')) gin_trgm_ops
);

-- --------------------------------------------------------------------------
--pgcrypto: seudonimizacion, integridad y cifrado controlado
-- --------------------------------------------------------------------------
-- El dataset esta anonimizado, pero se recomienda no exponer customer_id,
-- customer_unique_id o review_id en vistas analiticas externas.

CREATE OR REPLACE VIEW vw_customers_pseudonymized AS
SELECT
    ecommerce.sha256_text(customer_id) AS customer_hash,
    ecommerce.sha256_text(customer_unique_id) AS customer_unique_hash,
    customer_zip_code_prefix
FROM customers;

CREATE OR REPLACE VIEW vw_orders_pseudonymized AS
SELECT
    ecommerce.sha256_text(o.order_id) AS order_hash,
    ecommerce.sha256_text(o.customer_id) AS customer_hash,
    o.order_status,
    o.order_purchase_timestamp,
    o.order_approved_at,
    o.order_delivered_customer_date,
    o.order_estimated_delivery_date
FROM orders o;

CREATE OR REPLACE VIEW vw_reviews_pseudonymized AS
SELECT
    ecommerce.sha256_text(ow.review_id) AS review_hash,
    ecommerce.sha256_text(ow.order_id) AS order_hash,
    ow.review_content,
    ow.review_response_period
FROM order_reviews ow;


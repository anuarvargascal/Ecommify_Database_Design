-- Name: customers; Type: TABLE; Schema: ecommerce; Owner: postgres
--
CREATE TABLE ecommerce.customers (
    customer_id character(32) NOT NULL,
    customer_unique_id character(32) NOT NULL,
    customer_zip_code_prefix integer
);
-- Name: dim_geolocation_zip; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.dim_geolocation_zip (
    zip_code_prefix integer NOT NULL,
    city ecommerce.citext,
    state character(2) NOT NULL,
    geom ecommerce.geometry(Point,4326),
    geog ecommerce.geography(Point,4326)
);
-- Name: order_items; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.order_items (
    order_id character(32) NOT NULL,
    order_item_id integer NOT NULL,
    product_id character(32) NOT NULL,
    seller_id character(32) NOT NULL,
    shipping_limit_date timestamp without time zone NOT NULL,
    price numeric(12,2) NOT NULL,
    freight_value numeric(12,2) NOT NULL,
    CONSTRAINT order_items_freight_value_check CHECK ((freight_value >= (0)::numeric)),
    CONSTRAINT order_items_price_check CHECK ((price >= (0)::numeric))
);
-- Name: product_categories; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.product_categories (
    product_category_name character varying(100) NOT NULL,
    product_category_name_english character varying(100) NOT NULL
);

-- Name: products; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.products (
    product_id character(64) NOT NULL,
    product_category_name character varying(100),
    product_specifications jsonb
);

-- Name: COLUMN products.product_specifications; Type: COMMENT; Schema: ecommerce; Owner: postgres
--
COMMENT ON COLUMN ecommerce.products.product_specifications IS 'Especificaciones semiestructuradas del producto: atributos descriptivos, dimensiones.';

-- Name: order_payments; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.order_payments (
    order_id character(32) NOT NULL,
    payment_sequential integer NOT NULL,
    payment_type character varying(30) NOT NULL,
    payment_installments integer NOT NULL,
    payment_value numeric(12,2) NOT NULL,
    CONSTRAINT ck_payment_type CHECK (((payment_type)::text = ANY ((ARRAY['credit_card'::character varying, 'boleto'::character varying, 'voucher'::character varying, 'debit_card'::character varying, 'not_defined'::character varying])::text[]))),
    CONSTRAINT order_payments_payment_installments_check CHECK ((payment_installments >= 0)),
    CONSTRAINT order_payments_payment_value_check CHECK ((payment_value >= (0)::numeric))
);
-- Name: order_reviews; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.order_reviews (
    review_id character(32) NOT NULL,
    order_id character(32) NOT NULL,
    review_score smallint NOT NULL,
    review_content jsonb,
    review_response_period tstzrange,
    CONSTRAINT order_reviews_review_score_check CHECK (((review_score >= 1) AND (review_score <= 5)))
);

-- Name: COLUMN order_reviews.review_content; Type: COMMENT; Schema: ecommerce; Owner: postgres

COMMENT ON COLUMN ecommerce.order_reviews.review_content IS 'Contenido enriquecido de la resena en JSONB: titulo, mensaje. ';

-- Name: COLUMN order_reviews.review_response_period; Type: COMMENT; Schema: ecommerce; Owner: postgres
--

COMMENT ON COLUMN ecommerce.order_reviews.review_response_period IS 'Intervalo temporal entre la creacion de la resena y la respuesta, modelado con TSTZRANGE.';

-- Name: orders; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.orders (
    order_id character(32) NOT NULL,
    customer_id character(32) NOT NULL,
    order_status character varying(30) NOT NULL,
    order_purchase_timestamp timestamp without time zone NOT NULL,
    order_approved_at timestamp without time zone,
    order_delivered_carrier_date timestamp without time zone,
    order_delivered_customer_date timestamp without time zone,
    order_estimated_delivery_date timestamp without time zone NOT NULL,
    CONSTRAINT ck_order_status CHECK (((order_status)::text = ANY ((ARRAY['created'::character varying, 'approved'::character varying, 'invoiced'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'unavailable'::character varying, 'canceled'::character varying])::text[])))
);

-- Name: sellers; Type: TABLE; Schema: ecommerce; Owner: postgres
--

CREATE TABLE ecommerce.sellers (
    seller_id character(32) NOT NULL,
    seller_zip_code_prefix integer
);

-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);

-- Name: dim_geolocation_zip dim_geolocation_zip_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.dim_geolocation_zip
    ADD CONSTRAINT dim_geolocation_zip_pkey PRIMARY KEY (zip_code_prefix);

-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_id, order_item_id);

-- Name: order_payments order_payments_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_payments
    ADD CONSTRAINT order_payments_pkey PRIMARY KEY (order_id, payment_sequential);

-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);

-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (product_category_name);

-- Name: product_categories product_categories_product_category_name_english_key; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.product_categories
    ADD CONSTRAINT product_categories_product_category_name_english_key UNIQUE (product_category_name_english);

-- Name: products products_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);

-- Name: sellers sellers_pkey; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.sellers
    ADD CONSTRAINT sellers_pkey PRIMARY KEY (seller_id);

-- Name: order_reviews uq_review_order; Type: CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_reviews
    ADD CONSTRAINT uq_review_order UNIQUE (review_id, order_id);

-- Name: idx_dim_geolocation_city_trgm_search; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_dim_geolocation_city_trgm_search ON ecommerce.dim_geolocation_zip USING gin (ecommerce.normalize_text((COALESCE(city, ''::ecommerce.citext))::text) ecommerce.gin_trgm_ops);

-- Name: idx_dim_geolocation_zip_geog_gist; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_dim_geolocation_zip_geog_gist ON ecommerce.dim_geolocation_zip USING gist (geog);

-- Name: idx_dim_geolocation_zip_geom_gist; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_dim_geolocation_zip_geom_gist ON ecommerce.dim_geolocation_zip USING gist (geom);

-- Name: idx_order_items_order_id; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_items_order_id ON ecommerce.order_items USING btree (order_id);

-- Name: idx_order_payments_type; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_payments_type ON ecommerce.order_payments USING btree (payment_type);

-- Name: idx_order_payments_type_installments_order_inc; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_payments_type_installments_order_inc ON ecommerce.order_payments USING btree (payment_type, payment_installments, order_id) INCLUDE (payment_value);

-- Name: idx_order_reviews_content_gin; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_reviews_content_gin ON ecommerce.order_reviews USING gin (review_content);


-- Name: idx_order_reviews_period_low_score_gist; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_reviews_period_low_score_gist ON ecommerce.order_reviews USING gist (review_response_period) WHERE (review_score <= 3);

-- Name: idx_order_reviews_score; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_order_reviews_score ON ecommerce.order_reviews USING btree (review_score);

-- Name: idx_products_specifications_gin; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_products_specifications_gin ON ecommerce.products USING gin (product_specifications);

-- Name: idx_products_weight_g_numeric_desc; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_products_weight_g_numeric_desc ON ecommerce.products USING btree ((((product_specifications ->> 'product_weight_g'::text))::numeric) DESC) WHERE (product_specifications ? 'product_weight_g'::text);

-- Name: idx_reviews_low_score_message_order; Type: INDEX; Schema: ecommerce; Owner: postgres
--

CREATE INDEX idx_reviews_low_score_message_order ON ecommerce.order_reviews USING btree (review_score, order_id) WHERE (review_content ? 'message'::text);

-- Name: idx_sellers_zip; Type: INDEX; Schema: ecommerce; Owner: postgres
--
-- Name: customers fk_customer_zip; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.customers
    ADD CONSTRAINT fk_customer_zip FOREIGN KEY (customer_zip_code_prefix) REFERENCES ecommerce.dim_geolocation_zip(zip_code_prefix);

-- Name: order_items fk_item_order; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_items
    ADD CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES ecommerce.orders(order_id);

-- Name: order_items fk_item_product; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_items
    ADD CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES ecommerce.products(product_id);

-- Name: order_items fk_item_seller; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_items
    ADD CONSTRAINT fk_item_seller FOREIGN KEY (seller_id) REFERENCES ecommerce.sellers(seller_id);

-- Name: orders fk_order_customer; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.orders
    ADD CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES ecommerce.customers(customer_id);


-- Name: order_payments fk_payment_order; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_payments
    ADD CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES ecommerce.orders(order_id);

-- Name: products fk_product_category; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.products
    ADD CONSTRAINT fk_product_category FOREIGN KEY (product_category_name) REFERENCES ecommerce.product_categories(product_category_name);

-- Name: order_reviews fk_review_order; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.order_reviews
    ADD CONSTRAINT fk_review_order FOREIGN KEY (order_id) REFERENCES ecommerce.orders(order_id);

-- Name: sellers fk_seller_zip; Type: FK CONSTRAINT; Schema: ecommerce; Owner: postgres
--

ALTER TABLE ONLY ecommerce.sellers
    ADD CONSTRAINT fk_seller_zip FOREIGN KEY (seller_zip_code_prefix) REFERENCES ecommerce.dim_geolocation_zip(zip_code_prefix);



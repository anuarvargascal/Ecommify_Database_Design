// ============================================================================
// INSERCIÓN DE DATOS DE EJEMPLO REALISTAS
// Basados en el dataset Olist y los datos de ejemplo del diseño conceptual
// ============================================================================
use("ecommify_analytics_v1");
// ---------------------------------------------------------------------------
// DATOS: product_catalog (15 productos)
// ---------------------------------------------------------------------------

db.product_catalog.insertMany([
  {
    product_id: "fc93dd7f733b2e9ed94453e40e4fa677",
    category: { name: "esporte_lazer", name_en: "sports_leisure" },
    descriptive_attributes: { name_length: 50, description_length: 240, photos_qty: 3 },
    physical_attributes: {
      weight_g: 150,
      dimensions_cm: { length: 20, height: 10, width: 20 },
      volume_cm3: 4000
    },
    sales_summary: { orders_count: 45, items_sold: 52, total_revenue: 1034.48, avg_price: 22.99 },
    review_summary: { avg_score: 3.8, reviews_count: 38, score_distribution: { "1": 5, "2": 3, "3": 8, "4": 12, "5": 10 } },
    sellers: [
      { seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "2ddf9184f8aad1f832fdf5ecd1e53a17",
    category: { name: "perfumaria", name_en: "perfumery" },
    descriptive_attributes: { name_length: 58, description_length: 560, photos_qty: 1 },
    physical_attributes: {
      weight_g: 650,
      dimensions_cm: { length: 20, height: 8, width: 20 },
      volume_cm3: 3200
    },
    sales_summary: { orders_count: 120, items_sold: 135, total_revenue: 6196.50, avg_price: 45.90 },
    review_summary: { avg_score: 4.5, reviews_count: 98, score_distribution: { "1": 2, "2": 3, "3": 8, "4": 25, "5": 60 } },
    sellers: [
      { seller_id: "0c7533c71df861ec58ad7ff999ed0e8d", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "7c21d2794fad14d186b2bcd9b07a8298",
    category: { name: "cool_stuff", name_en: "cool_stuff" },
    descriptive_attributes: { name_length: 45, description_length: 941, photos_qty: 1 },
    physical_attributes: {
      weight_g: 1000,
      dimensions_cm: { length: 42, height: 25, width: 15 },
      volume_cm3: 15750
    },
    sales_summary: { orders_count: 78, items_sold: 85, total_revenue: 5354.15, avg_price: 62.99 },
    review_summary: { avg_score: 4.1, reviews_count: 65, score_distribution: { "1": 3, "2": 5, "3": 10, "4": 22, "5": 25 } },
    sellers: [
      { seller_id: "7a67c85e85bb2ce8582c35f2203ad736", state: "SC" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "154e7e31ebfa092203795c972e5804a6",
    category: { name: "beleza_saude", name_en: "health_beauty" },
    descriptive_attributes: { name_length: 48, description_length: 575, photos_qty: 1 },
    physical_attributes: {
      weight_g: 100,
      dimensions_cm: { length: 20, height: 15, width: 15 },
      volume_cm3: 4500
    },
    sales_summary: { orders_count: 200, items_sold: 230, total_revenue: 4597.70, avg_price: 19.99 },
    review_summary: { avg_score: 4.7, reviews_count: 180, score_distribution: { "1": 2, "2": 3, "3": 10, "4": 45, "5": 120 } },
    sellers: [
      { seller_id: "cc419e0650a3c5ba77189a1882b7556a", state: "PR" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    category: { name: "informatica_acessorios", name_en: "computers_accessories" },
    descriptive_attributes: { name_length: 62, description_length: 890, photos_qty: 4 },
    physical_attributes: {
      weight_g: 350,
      dimensions_cm: { length: 30, height: 5, width: 22 },
      volume_cm3: 3300
    },
    sales_summary: { orders_count: 310, items_sold: 340, total_revenue: 27200.00, avg_price: 80.00 },
    review_summary: { avg_score: 4.2, reviews_count: 250, score_distribution: { "1": 10, "2": 15, "3": 30, "4": 85, "5": 110 } },
    sellers: [
      { seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23", state: "SP" },
      { seller_id: "0c7533c71df861ec58ad7ff999ed0e8d", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7",
    category: { name: "moveis_decoracao", name_en: "furniture_decor" },
    descriptive_attributes: { name_length: 55, description_length: 720, photos_qty: 5 },
    physical_attributes: {
      weight_g: 8500,
      dimensions_cm: { length: 120, height: 80, width: 60 },
      volume_cm3: 576000
    },
    sales_summary: { orders_count: 35, items_sold: 35, total_revenue: 15750.00, avg_price: 450.00 },
    review_summary: { avg_score: 3.5, reviews_count: 28, score_distribution: { "1": 4, "2": 3, "3": 5, "4": 10, "5": 6 } },
    sellers: [
      { seller_id: "7a67c85e85bb2ce8582c35f2203ad736", state: "SC" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8",
    category: { name: "telefonia", name_en: "telephony" },
    descriptive_attributes: { name_length: 40, description_length: 450, photos_qty: 2 },
    physical_attributes: {
      weight_g: 200,
      dimensions_cm: { length: 15, height: 8, width: 8 },
      volume_cm3: 960
    },
    sales_summary: { orders_count: 520, items_sold: 580, total_revenue: 17400.00, avg_price: 30.00 },
    review_summary: { avg_score: 3.9, reviews_count: 420, score_distribution: { "1": 30, "2": 25, "3": 60, "4": 150, "5": 155 } },
    sellers: [
      { seller_id: "cc419e0650a3c5ba77189a1882b7556a", state: "PR" },
      { seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9",
    category: { name: "eletronicos", name_en: "electronics" },
    descriptive_attributes: { name_length: 70, description_length: 1200, photos_qty: 6 },
    physical_attributes: {
      weight_g: 1500,
      dimensions_cm: { length: 35, height: 20, width: 25 },
      volume_cm3: 17500
    },
    sales_summary: { orders_count: 150, items_sold: 160, total_revenue: 48000.00, avg_price: 300.00 },
    review_summary: { avg_score: 4.0, reviews_count: 130, score_distribution: { "1": 8, "2": 10, "3": 20, "4": 42, "5": 50 } },
    sellers: [
      { seller_id: "0c7533c71df861ec58ad7ff999ed0e8d", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0",
    category: { name: "cama_mesa_banho", name_en: "bed_bath_table" },
    descriptive_attributes: { name_length: 35, description_length: 300, photos_qty: 2 },
    physical_attributes: {
      weight_g: 2200,
      dimensions_cm: { length: 50, height: 40, width: 30 },
      volume_cm3: 60000
    },
    sales_summary: { orders_count: 90, items_sold: 95, total_revenue: 7125.00, avg_price: 75.00 },
    review_summary: { avg_score: 4.3, reviews_count: 72, score_distribution: { "1": 2, "2": 4, "3": 8, "4": 28, "5": 30 } },
    sellers: [
      { seller_id: "7a67c85e85bb2ce8582c35f2203ad736", state: "SC" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1",
    category: { name: "automotivo", name_en: "auto" },
    descriptive_attributes: { name_length: 42, description_length: 380, photos_qty: 3 },
    physical_attributes: {
      weight_g: 5500,
      dimensions_cm: { length: 60, height: 30, width: 40 },
      volume_cm3: 72000
    },
    sales_summary: { orders_count: 25, items_sold: 28, total_revenue: 3500.00, avg_price: 125.00 },
    review_summary: { avg_score: 3.2, reviews_count: 20, score_distribution: { "1": 3, "2": 4, "3": 5, "4": 5, "5": 3 } },
    sellers: [
      { seller_id: "cc419e0650a3c5ba77189a1882b7556a", state: "PR" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2",
    category: { name: "brinquedos", name_en: "toys" },
    descriptive_attributes: { name_length: 38, description_length: 420, photos_qty: 4 },
    physical_attributes: {
      weight_g: 800,
      dimensions_cm: { length: 25, height: 20, width: 15 },
      volume_cm3: 7500
    },
    sales_summary: { orders_count: 180, items_sold: 210, total_revenue: 6300.00, avg_price: 30.00 },
    review_summary: { avg_score: 4.6, reviews_count: 155, score_distribution: { "1": 3, "2": 5, "3": 12, "4": 40, "5": 95 } },
    sellers: [
      { seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23", state: "SP" },
      { seller_id: "cc419e0650a3c5ba77189a1882b7556a", state: "PR" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3",
    category: { name: "ferramentas_jardim", name_en: "garden_tools" },
    descriptive_attributes: { name_length: 52, description_length: 680, photos_qty: 3 },
    physical_attributes: {
      weight_g: 12000,
      dimensions_cm: { length: 100, height: 50, width: 40 },
      volume_cm3: 200000
    },
    sales_summary: { orders_count: 15, items_sold: 15, total_revenue: 4500.00, avg_price: 300.00 },
    review_summary: { avg_score: 3.8, reviews_count: 12, score_distribution: { "1": 1, "2": 1, "3": 3, "4": 4, "5": 3 } },
    sellers: [
      { seller_id: "7a67c85e85bb2ce8582c35f2203ad736", state: "SC" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4",
    category: { name: "livros_interesse_geral", name_en: "books_general_interest" },
    descriptive_attributes: { name_length: 65, description_length: 1500, photos_qty: 1 },
    physical_attributes: {
      weight_g: 400,
      dimensions_cm: { length: 22, height: 15, width: 3 },
      volume_cm3: 990
    },
    sales_summary: { orders_count: 85, items_sold: 90, total_revenue: 2250.00, avg_price: 25.00 },
    review_summary: { avg_score: 4.8, reviews_count: 78, score_distribution: { "1": 0, "2": 1, "3": 3, "4": 14, "5": 60 } },
    sellers: [
      { seller_id: "0c7533c71df861ec58ad7ff999ed0e8d", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5",
    category: { name: "papelaria", name_en: "stationery" },
    descriptive_attributes: { name_length: 30, description_length: 200, photos_qty: 2 },
    physical_attributes: {
      weight_g: 50,
      dimensions_cm: { length: 10, height: 5, width: 8 },
      volume_cm3: 400
    },
    sales_summary: { orders_count: 400, items_sold: 480, total_revenue: 4800.00, avg_price: 10.00 },
    review_summary: { avg_score: 4.4, reviews_count: 350, score_distribution: { "1": 5, "2": 10, "3": 25, "4": 110, "5": 200 } },
    sellers: [
      { seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23", state: "SP" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  },
  {
    product_id: "e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6",
    category: { name: "relogios_presentes", name_en: "watches_gifts" },
    descriptive_attributes: { name_length: 44, description_length: 510, photos_qty: 3 },
    physical_attributes: {
      weight_g: 300,
      dimensions_cm: { length: 12, height: 10, width: 10 },
      volume_cm3: 1200
    },
    sales_summary: { orders_count: 95, items_sold: 100, total_revenue: 15000.00, avg_price: 150.00 },
    review_summary: { avg_score: 4.1, reviews_count: 80, score_distribution: { "1": 4, "2": 6, "3": 12, "4": 28, "5": 30 } },
    sellers: [
      { seller_id: "0c7533c71df861ec58ad7ff999ed0e8d", state: "SP" },
      { seller_id: "cc419e0650a3c5ba77189a1882b7556a", state: "PR" }
    ],
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z"), batch_id: "batch_001" }
  }
]);

print("✅ 15 documentos insertados en product_catalog");

// ---------------------------------------------------------------------------
// DATOS: order_analytics (12 pedidos)
// ---------------------------------------------------------------------------

db.order_analytics.insertMany([
  {
    order_id: "d05d5881240a2b6f02e90a83bddc85cd",
    status: "delivered",
    purchase_timestamp: new Date("2018-08-04T02:33:09Z"),
    approved_at: new Date("2018-08-04T02:45:08Z"),
    delivered_carrier_date: new Date("2018-08-09T13:32:00Z"),
    delivered_customer_date: new Date("2018-08-13T18:22:39Z"),
    estimated_delivery_date: new Date("2018-08-28T00:00:00Z"),
    customer: {
      customer_id: "940958db94c59ca04dcc41aa5cb5417e",
      customer_unique_id: "84e037025fe4760f11813baa2e18191d",
      state: "SP",
      city: "ferraz de vasconcelos",
      zip_code_prefix: 8531
    },
    items: [
      {
        order_item_id: 1,
        product_id: "fc93dd7f733b2e9ed94453e40e4fa677",
        product_category: "sports_leisure",
        seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23",
        seller_state: "SP",
        price: 22.99,
        freight_value: 7.42,
        shipping_limit_date: new Date("2018-08-07T02:45:08Z")
      }
    ],
    payments: [
      { sequential: 1, type: "debit_card", installments: 1, value: 30.41 }
    ],
    review: {
      review_id: "78ef188726f0bf273844e117b63e1d80",
      score: 1,
      title: null,
      message: "Empresa sem compromisso com o cliente",
      creation_date: new Date("2018-08-11T00:00:00Z"),
      answer_date: new Date("2018-08-11T14:06:21Z"),
      tags: ["negative", "with_message"]
    },
    totals: {
      items_count: 1,
      total_product_value: 22.99,
      total_freight: 7.42,
      total_payment: 30.41
    },
    logistics: {
      delivery_days: 9,
      estimated_days: 24,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "6d983186ed41c01b43e558f2d7a68010",
    status: "delivered",
    purchase_timestamp: new Date("2017-12-07T09:02:01Z"),
    approved_at: new Date("2017-12-07T09:10:41Z"),
    delivered_carrier_date: new Date("2017-12-07T21:07:31Z"),
    delivered_customer_date: new Date("2017-12-26T22:24:57Z"),
    estimated_delivery_date: new Date("2018-01-10T00:00:00Z"),
    customer: {
      customer_id: "06079613a06e0e5f7eb9bbeadd0d9de2",
      customer_unique_id: "02da8fcebd2647c0ed524014e68bc5ae",
      state: "MT",
      city: "sinop",
      zip_code_prefix: 78556
    },
    items: [
      {
        order_item_id: 1,
        product_id: "2ddf9184f8aad1f832fdf5ecd1e53a17",
        product_category: "perfumery",
        seller_id: "0c7533c71df861ec58ad7ff999ed0e8d",
        seller_state: "SP",
        price: 45.90,
        freight_value: 17.92,
        shipping_limit_date: new Date("2017-12-13T09:10:41Z")
      }
    ],
    payments: [
      { sequential: 1, type: "voucher", installments: 1, value: 63.82 }
    ],
    review: {
      review_id: "f4fe6a8976ba615c00f0c5e42250d293",
      score: 5,
      title: null,
      message: "amei e chegou até antes do esperado",
      creation_date: new Date("2017-12-27T00:00:00Z"),
      answer_date: new Date("2017-12-28T01:11:47Z"),
      tags: ["positive", "with_message"]
    },
    totals: {
      items_count: 1,
      total_product_value: 45.90,
      total_freight: 17.92,
      total_payment: 63.82
    },
    logistics: {
      delivery_days: 19,
      estimated_days: 34,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "78c96fa659d86790819c423216522535",
    status: "delivered",
    purchase_timestamp: new Date("2017-06-16T21:25:14Z"),
    approved_at: new Date("2017-06-16T21:35:12Z"),
    delivered_carrier_date: new Date("2017-06-21T16:02:57Z"),
    delivered_customer_date: new Date("2017-06-30T15:26:42Z"),
    estimated_delivery_date: new Date("2017-07-18T00:00:00Z"),
    customer: {
      customer_id: "105507c4c509dd35a7c26e05c7039089",
      customer_unique_id: "4812bbd35d1412c209481b349966ed9e",
      state: "SP",
      city: "sao paulo",
      zip_code_prefix: 46800
    },
    items: [
      {
        order_item_id: 1,
        product_id: "7c21d2794fad14d186b2bcd9b07a8298",
        product_category: "cool_stuff",
        seller_id: "7a67c85e85bb2ce8582c35f2203ad736",
        seller_state: "SC",
        price: 62.99,
        freight_value: 19.68,
        shipping_limit_date: new Date("2017-06-21T21:35:12Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 4, value: 82.67 }
    ],
    review: {
      review_id: "ea70389d0aee26a9d7cb9ce3ea9a6650",
      score: 4,
      title: null,
      message: null,
      creation_date: new Date("2017-07-01T00:00:00Z"),
      answer_date: new Date("2017-07-01T23:07:33Z"),
      tags: ["positive"]
    },
    totals: {
      items_count: 1,
      total_product_value: 62.99,
      total_freight: 19.68,
      total_payment: 82.67
    },
    logistics: {
      delivery_days: 13,
      estimated_days: 31,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "83073309378cf709e67e8368e97447c4",
    status: "delivered",
    purchase_timestamp: new Date("2017-07-19T13:58:48Z"),
    approved_at: new Date("2017-07-19T14:10:21Z"),
    delivered_carrier_date: new Date("2017-07-21T12:17:30Z"),
    delivered_customer_date: new Date("2017-07-24T15:52:33Z"),
    estimated_delivery_date: new Date("2017-08-15T00:00:00Z"),
    customer: {
      customer_id: "3e0deaa9670f05d91d2f9cd373e1aeae",
      customer_unique_id: "8330487414ad3eb5e05a6a8a03272b34",
      state: "SP",
      city: "sao paulo",
      zip_code_prefix: 6152
    },
    items: [
      {
        order_item_id: 1,
        product_id: "154e7e31ebfa092203795c972e5804a6",
        product_category: "health_beauty",
        seller_id: "cc419e0650a3c5ba77189a1882b7556a",
        seller_state: "PR",
        price: 19.99,
        freight_value: 7.78,
        shipping_limit_date: new Date("2017-07-28T14:10:21Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 2, value: 27.77 }
    ],
    review: {
      review_id: "79c798a201538ab543bb86af0182f4c9",
      score: 5,
      title: null,
      message: null,
      creation_date: new Date("2017-07-25T00:00:00Z"),
      answer_date: new Date("2017-07-25T19:30:06Z"),
      tags: ["positive"]
    },
    totals: {
      items_count: 1,
      total_product_value: 19.99,
      total_freight: 7.78,
      total_payment: 27.77
    },
    logistics: {
      delivery_days: 5,
      estimated_days: 27,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "aa1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
    status: "delivered",
    purchase_timestamp: new Date("2018-03-15T14:22:00Z"),
    approved_at: new Date("2018-03-15T14:35:00Z"),
    delivered_carrier_date: new Date("2018-03-19T10:00:00Z"),
    delivered_customer_date: new Date("2018-03-28T16:30:00Z"),
    estimated_delivery_date: new Date("2018-04-10T00:00:00Z"),
    customer: {
      customer_id: "aaa111bbb222ccc333ddd444eee555ff",
      customer_unique_id: "unique_customer_001",
      state: "RJ",
      city: "rio de janeiro",
      zip_code_prefix: 20000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        product_category: "computers_accessories",
        seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23",
        seller_state: "SP",
        price: 80.00,
        freight_value: 12.50,
        shipping_limit_date: new Date("2018-03-20T14:35:00Z")
      },
      {
        order_item_id: 2,
        product_id: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8",
        product_category: "telephony",
        seller_id: "cc419e0650a3c5ba77189a1882b7556a",
        seller_state: "PR",
        price: 30.00,
        freight_value: 8.00,
        shipping_limit_date: new Date("2018-03-20T14:35:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 3, value: 130.50 }
    ],
    review: {
      review_id: "rev_aa001",
      score: 4,
      title: "Bom produto",
      message: "Chegou no prazo e produto em bom estado",
      creation_date: new Date("2018-03-29T00:00:00Z"),
      answer_date: new Date("2018-03-30T10:00:00Z"),
      tags: ["positive", "with_message"]
    },
    totals: {
      items_count: 2,
      total_product_value: 110.00,
      total_freight: 20.50,
      total_payment: 130.50
    },
    logistics: {
      delivery_days: 13,
      estimated_days: 26,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "bb2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    status: "delivered",
    purchase_timestamp: new Date("2018-04-10T08:15:00Z"),
    approved_at: new Date("2018-04-10T08:30:00Z"),
    delivered_carrier_date: new Date("2018-04-12T14:00:00Z"),
    delivered_customer_date: new Date("2018-04-25T11:00:00Z"),
    estimated_delivery_date: new Date("2018-04-22T00:00:00Z"),
    customer: {
      customer_id: "bbb222ccc333ddd444eee555fff666aa",
      customer_unique_id: "unique_customer_002",
      state: "MG",
      city: "belo horizonte",
      zip_code_prefix: 30000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7",
        product_category: "furniture_decor",
        seller_id: "7a67c85e85bb2ce8582c35f2203ad736",
        seller_state: "SC",
        price: 450.00,
        freight_value: 65.00,
        shipping_limit_date: new Date("2018-04-15T08:30:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 10, value: 515.00 }
    ],
    review: {
      review_id: "rev_bb002",
      score: 2,
      title: "Atrasado",
      message: "Produto chegou 3 dias depois do prazo estimado",
      creation_date: new Date("2018-04-26T00:00:00Z"),
      answer_date: new Date("2018-04-27T09:00:00Z"),
      tags: ["negative", "with_message", "late_delivery"]
    },
    totals: {
      items_count: 1,
      total_product_value: 450.00,
      total_freight: 65.00,
      total_payment: 515.00
    },
    logistics: {
      delivery_days: 15,
      estimated_days: 12,
      on_time: false
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "cc3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    status: "shipped",
    purchase_timestamp: new Date("2018-05-20T18:00:00Z"),
    approved_at: new Date("2018-05-20T18:15:00Z"),
    delivered_carrier_date: new Date("2018-05-22T09:00:00Z"),
    delivered_customer_date: null,
    estimated_delivery_date: new Date("2018-06-05T00:00:00Z"),
    customer: {
      customer_id: "ccc333ddd444eee555fff666aaa777bb",
      customer_unique_id: "unique_customer_003",
      state: "BA",
      city: "salvador",
      zip_code_prefix: 40000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9",
        product_category: "electronics",
        seller_id: "0c7533c71df861ec58ad7ff999ed0e8d",
        seller_state: "SP",
        price: 300.00,
        freight_value: 35.00,
        shipping_limit_date: new Date("2018-05-25T18:15:00Z")
      },
      {
        order_item_id: 2,
        product_id: "d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5",
        product_category: "stationery",
        seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23",
        seller_state: "SP",
        price: 10.00,
        freight_value: 5.00,
        shipping_limit_date: new Date("2018-05-25T18:15:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 6, value: 300.00 },
      { sequential: 2, type: "voucher", installments: 1, value: 50.00 }
    ],
    review: null,
    totals: {
      items_count: 2,
      total_product_value: 310.00,
      total_freight: 40.00,
      total_payment: 350.00
    },
    logistics: {
      delivery_days: null,
      estimated_days: 16,
      on_time: null
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "dd4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    status: "canceled",
    purchase_timestamp: new Date("2018-02-14T10:00:00Z"),
    approved_at: null,
    delivered_carrier_date: null,
    delivered_customer_date: null,
    estimated_delivery_date: new Date("2018-03-01T00:00:00Z"),
    customer: {
      customer_id: "ddd444eee555fff666aaa777bbb888cc",
      customer_unique_id: "unique_customer_004",
      state: "RS",
      city: "porto alegre",
      zip_code_prefix: 90000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6",
        product_category: "watches_gifts",
        seller_id: "0c7533c71df861ec58ad7ff999ed0e8d",
        seller_state: "SP",
        price: 150.00,
        freight_value: 18.00,
        shipping_limit_date: new Date("2018-02-19T10:00:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "boleto", installments: 1, value: 168.00 }
    ],
    review: null,
    totals: {
      items_count: 1,
      total_product_value: 150.00,
      total_freight: 18.00,
      total_payment: 168.00
    },
    logistics: {
      delivery_days: null,
      estimated_days: 15,
      on_time: null
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "ee5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    status: "delivered",
    purchase_timestamp: new Date("2018-01-20T16:45:00Z"),
    approved_at: new Date("2018-01-20T17:00:00Z"),
    delivered_carrier_date: new Date("2018-01-23T08:00:00Z"),
    delivered_customer_date: new Date("2018-01-30T14:00:00Z"),
    estimated_delivery_date: new Date("2018-02-10T00:00:00Z"),
    customer: {
      customer_id: "eee555fff666aaa777bbb888ccc999dd",
      customer_unique_id: "unique_customer_005",
      state: "SP",
      city: "campinas",
      zip_code_prefix: 13000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2",
        product_category: "toys",
        seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23",
        seller_state: "SP",
        price: 30.00,
        freight_value: 8.50,
        shipping_limit_date: new Date("2018-01-25T17:00:00Z")
      },
      {
        order_item_id: 2,
        product_id: "c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4",
        product_category: "books_general_interest",
        seller_id: "0c7533c71df861ec58ad7ff999ed0e8d",
        seller_state: "SP",
        price: 25.00,
        freight_value: 6.00,
        shipping_limit_date: new Date("2018-01-25T17:00:00Z")
      },
      {
        order_item_id: 3,
        product_id: "d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5",
        product_category: "stationery",
        seller_id: "1da3aeb70d7989d1e6d9b0e887f97c23",
        seller_state: "SP",
        price: 10.00,
        freight_value: 3.50,
        shipping_limit_date: new Date("2018-01-25T17:00:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 2, value: 83.00 }
    ],
    review: {
      review_id: "rev_ee005",
      score: 5,
      title: "Excelente",
      message: "Tudo perfeito, entrega rápida",
      creation_date: new Date("2018-01-31T00:00:00Z"),
      answer_date: new Date("2018-02-01T08:00:00Z"),
      tags: ["positive", "with_message"]
    },
    totals: {
      items_count: 3,
      total_product_value: 65.00,
      total_freight: 18.00,
      total_payment: 83.00
    },
    logistics: {
      delivery_days: 10,
      estimated_days: 21,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "ff6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    status: "delivered",
    purchase_timestamp: new Date("2018-03-22T11:00:00Z"),
    approved_at: new Date("2018-03-22T11:20:00Z"),
    delivered_carrier_date: new Date("2018-03-26T09:00:00Z"),
    delivered_customer_date: new Date("2018-04-02T17:00:00Z"),
    estimated_delivery_date: new Date("2018-04-08T00:00:00Z"),
    customer: {
      customer_id: "fff666aaa777bbb888ccc999ddd000ee",
      customer_unique_id: "unique_customer_001",
      state: "RJ",
      city: "rio de janeiro",
      zip_code_prefix: 20000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0",
        product_category: "bed_bath_table",
        seller_id: "7a67c85e85bb2ce8582c35f2203ad736",
        seller_state: "SC",
        price: 75.00,
        freight_value: 15.00,
        shipping_limit_date: new Date("2018-03-27T11:20:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "debit_card", installments: 1, value: 90.00 }
    ],
    review: {
      review_id: "rev_ff006",
      score: 3,
      title: null,
      message: "Produto OK, mas embalagem danificada",
      creation_date: new Date("2018-04-03T00:00:00Z"),
      answer_date: new Date("2018-04-05T12:00:00Z"),
      tags: ["neutral", "with_message"]
    },
    totals: {
      items_count: 1,
      total_product_value: 75.00,
      total_freight: 15.00,
      total_payment: 90.00
    },
    logistics: {
      delivery_days: 11,
      estimated_days: 17,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "gg7g8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    status: "delivered",
    purchase_timestamp: new Date("2018-05-05T20:00:00Z"),
    approved_at: new Date("2018-05-05T20:15:00Z"),
    delivered_carrier_date: new Date("2018-05-08T10:00:00Z"),
    delivered_customer_date: new Date("2018-05-15T14:30:00Z"),
    estimated_delivery_date: new Date("2018-05-25T00:00:00Z"),
    customer: {
      customer_id: "ggg777hhh888iii999jjj000kkk111ll",
      customer_unique_id: "unique_customer_006",
      state: "SP",
      city: "sao paulo",
      zip_code_prefix: 1000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1",
        product_category: "auto",
        seller_id: "cc419e0650a3c5ba77189a1882b7556a",
        seller_state: "PR",
        price: 125.00,
        freight_value: 22.00,
        shipping_limit_date: new Date("2018-05-10T20:15:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "boleto", installments: 1, value: 147.00 }
    ],
    review: {
      review_id: "rev_gg007",
      score: 2,
      title: "Decepcionado",
      message: "Produto não corresponde à descrição. Peso diferente do anunciado.",
      creation_date: new Date("2018-05-16T00:00:00Z"),
      answer_date: new Date("2018-05-18T15:00:00Z"),
      tags: ["negative", "with_message"]
    },
    totals: {
      items_count: 1,
      total_product_value: 125.00,
      total_freight: 22.00,
      total_payment: 147.00
    },
    logistics: {
      delivery_days: 10,
      estimated_days: 20,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  },
  {
    order_id: "hh8h9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    status: "delivered",
    purchase_timestamp: new Date("2018-04-01T07:30:00Z"),
    approved_at: new Date("2018-04-01T07:45:00Z"),
    delivered_carrier_date: new Date("2018-04-03T11:00:00Z"),
    delivered_customer_date: new Date("2018-04-10T09:00:00Z"),
    estimated_delivery_date: new Date("2018-04-18T00:00:00Z"),
    customer: {
      customer_id: "hhh888iii999jjj000kkk111lll222mm",
      customer_unique_id: "unique_customer_002",
      state: "MG",
      city: "belo horizonte",
      zip_code_prefix: 30000
    },
    items: [
      {
        order_item_id: 1,
        product_id: "b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3",
        product_category: "garden_tools",
        seller_id: "7a67c85e85bb2ce8582c35f2203ad736",
        seller_state: "SC",
        price: 300.00,
        freight_value: 45.00,
        shipping_limit_date: new Date("2018-04-06T07:45:00Z")
      }
    ],
    payments: [
      { sequential: 1, type: "credit_card", installments: 5, value: 345.00 }
    ],
    review: {
      review_id: "rev_hh008",
      score: 4,
      title: "Bom",
      message: "Ferramenta robusta, recomendo",
      creation_date: new Date("2018-04-11T00:00:00Z"),
      answer_date: new Date("2018-04-12T14:00:00Z"),
      tags: ["positive", "with_message"]
    },
    totals: {
      items_count: 1,
      total_product_value: 300.00,
      total_freight: 45.00,
      total_payment: 345.00
    },
    logistics: {
      delivery_days: 9,
      estimated_days: 17,
      on_time: true
    },
    has_overflow: false,
    _sync: { source: "postgresql_etl", synced_at: new Date("2026-06-14T10:00:00Z") }
  }
]);

print("✅ 12 documentos insertados en order_analytics");

// ---------------------------------------------------------------------------
// DATOS: reviews_analytics (10 reseñas)
// ---------------------------------------------------------------------------

db.reviews_analytics.insertMany([
  {
    review_id: "78ef188726f0bf273844e117b63e1d80",
    order_id: "d05d5881240a2b6f02e90a83bddc85cd",
    review_score: 1,
    text: { title: null, message: "Empresa sem compromisso com o cliente" },
    tags: ["negative", "with_message", "score_1"],
    response_time_hours: 14.1,
    creation_date: new Date("2018-08-11T00:00:00Z"),
    answer_date: new Date("2018-08-11T14:06:21Z"),
    product_ids: ["fc93dd7f733b2e9ed94453e40e4fa677"],
    product_categories: ["sports_leisure"],
    seller_ids: ["1da3aeb70d7989d1e6d9b0e887f97c23"],
    customer: { customer_unique_id: "84e037025fe4760f11813baa2e18191d", state: "SP" }
  },
  {
    review_id: "f4fe6a8976ba615c00f0c5e42250d293",
    order_id: "6d983186ed41c01b43e558f2d7a68010",
    review_score: 5,
    text: { title: null, message: "amei e chegou até antes do esperado" },
    tags: ["positive", "with_message", "score_5"],
    response_time_hours: 25.2,
    creation_date: new Date("2017-12-27T00:00:00Z"),
    answer_date: new Date("2017-12-28T01:11:47Z"),
    product_ids: ["2ddf9184f8aad1f832fdf5ecd1e53a17"],
    product_categories: ["perfumery"],
    seller_ids: ["0c7533c71df861ec58ad7ff999ed0e8d"],
    customer: { customer_unique_id: "02da8fcebd2647c0ed524014e68bc5ae", state: "MT" }
  },
  {
    review_id: "ea70389d0aee26a9d7cb9ce3ea9a6650",
    order_id: "78c96fa659d86790819c423216522535",
    review_score: 4,
    text: { title: null, message: null },
    tags: ["positive", "score_4"],
    response_time_hours: 23.1,
    creation_date: new Date("2017-07-01T00:00:00Z"),
    answer_date: new Date("2017-07-01T23:07:33Z"),
    product_ids: ["7c21d2794fad14d186b2bcd9b07a8298"],
    product_categories: ["cool_stuff"],
    seller_ids: ["7a67c85e85bb2ce8582c35f2203ad736"],
    customer: { customer_unique_id: "4812bbd35d1412c209481b349966ed9e", state: "SP" }
  },
  {
    review_id: "79c798a201538ab543bb86af0182f4c9",
    order_id: "83073309378cf709e67e8368e97447c4",
    review_score: 5,
    text: { title: null, message: null },
    tags: ["positive", "score_5"],
    response_time_hours: 19.5,
    creation_date: new Date("2017-07-25T00:00:00Z"),
    answer_date: new Date("2017-07-25T19:30:06Z"),
    product_ids: ["154e7e31ebfa092203795c972e5804a6"],
    product_categories: ["health_beauty"],
    seller_ids: ["cc419e0650a3c5ba77189a1882b7556a"],
    customer: { customer_unique_id: "8330487414ad3eb5e05a6a8a03272b34", state: "SP" }
  },
  {
    review_id: "rev_aa001",
    order_id: "aa1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
    review_score: 4,
    text: { title: "Bom produto", message: "Chegou no prazo e produto em bom estado" },
    tags: ["positive", "with_message", "score_4"],
    response_time_hours: 34.0,
    creation_date: new Date("2018-03-29T00:00:00Z"),
    answer_date: new Date("2018-03-30T10:00:00Z"),
    product_ids: ["a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6", "c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8"],
    product_categories: ["computers_accessories", "telephony"],
    seller_ids: ["1da3aeb70d7989d1e6d9b0e887f97c23", "cc419e0650a3c5ba77189a1882b7556a"],
    customer: { customer_unique_id: "unique_customer_001", state: "RJ" }
  },
  {
    review_id: "rev_bb002",
    order_id: "bb2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    review_score: 2,
    text: { title: "Atrasado", message: "Produto chegou 3 dias depois do prazo estimado" },
    tags: ["negative", "with_message", "late_delivery", "score_2"],
    response_time_hours: 33.0,
    creation_date: new Date("2018-04-26T00:00:00Z"),
    answer_date: new Date("2018-04-27T09:00:00Z"),
    product_ids: ["b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7"],
    product_categories: ["furniture_decor"],
    seller_ids: ["7a67c85e85bb2ce8582c35f2203ad736"],
    customer: { customer_unique_id: "unique_customer_002", state: "MG" }
  },
  {
    review_id: "rev_ee005",
    order_id: "ee5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    review_score: 5,
    text: { title: "Excelente", message: "Tudo perfeito, entrega rápida" },
    tags: ["positive", "with_message", "score_5"],
    response_time_hours: 32.0,
    creation_date: new Date("2018-01-31T00:00:00Z"),
    answer_date: new Date("2018-02-01T08:00:00Z"),
    product_ids: ["a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2", "c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4", "d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5"],
    product_categories: ["toys", "books_general_interest", "stationery"],
    seller_ids: ["1da3aeb70d7989d1e6d9b0e887f97c23", "0c7533c71df861ec58ad7ff999ed0e8d"],
    customer: { customer_unique_id: "unique_customer_005", state: "SP" }
  },
  {
    review_id: "rev_ff006",
    order_id: "ff6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    review_score: 3,
    text: { title: null, message: "Produto OK, mas embalagem danificada" },
    tags: ["neutral", "with_message", "score_3"],
    response_time_hours: 60.0,
    creation_date: new Date("2018-04-03T00:00:00Z"),
    answer_date: new Date("2018-04-05T12:00:00Z"),
    product_ids: ["e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0"],
    product_categories: ["bed_bath_table"],
    seller_ids: ["7a67c85e85bb2ce8582c35f2203ad736"],
    customer: { customer_unique_id: "unique_customer_001", state: "RJ" }
  },
  {
    review_id: "rev_gg007",
    order_id: "gg7g8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    review_score: 2,
    text: { title: "Decepcionado", message: "Produto não corresponde à descrição. Peso diferente do anunciado." },
    tags: ["negative", "with_message", "score_2"],
    response_time_hours: 63.0,
    creation_date: new Date("2018-05-16T00:00:00Z"),
    answer_date: new Date("2018-05-18T15:00:00Z"),
    product_ids: ["f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1"],
    product_categories: ["auto"],
    seller_ids: ["cc419e0650a3c5ba77189a1882b7556a"],
    customer: { customer_unique_id: "unique_customer_006", state: "SP" }
  },
  {
    review_id: "rev_hh008",
    order_id: "hh8h9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    review_score: 4,
    text: { title: "Bom", message: "Ferramenta robusta, recomendo" },
    tags: ["positive", "with_message", "score_4"],
    response_time_hours: 38.0,
    creation_date: new Date("2018-04-11T00:00:00Z"),
    answer_date: new Date("2018-04-12T14:00:00Z"),
    product_ids: ["b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3"],
    product_categories: ["garden_tools"],
    seller_ids: ["7a67c85e85bb2ce8582c35f2203ad736"],
    customer: { customer_unique_id: "unique_customer_002", state: "MG" }
  }
]);

print("✅ 10 documentos insertados en reviews_analytics");

// ---------------------------------------------------------------------------
// DATOS: user_behavior (6 usuarios con bucket por período)
// ---------------------------------------------------------------------------

db.user_behavior.insertMany([
  {
    customer_unique_id: "84e037025fe4760f11813baa2e18191d",
    period: "2018-Q3",
    metrics: {
      total_orders: 1, total_spent: 30.41, avg_order_value: 30.41,
      total_items: 1, avg_review_score: 1.0, preferred_payment_type: "debit_card",
      distinct_categories: 1
    },
    orders: [
      { order_id: "d05d5881240a2b6f02e90a83bddc85cd", purchase_date: new Date("2018-08-04T02:33:09Z"), status: "delivered", total_value: 30.41, items_count: 1, review_score: 1 }
    ],
    segments: ["one_time_buyer", "low_satisfaction"],
    location: { state: "SP", city: "ferraz de vasconcelos" }
  },
  {
    customer_unique_id: "02da8fcebd2647c0ed524014e68bc5ae",
    period: "2017-Q4",
    metrics: {
      total_orders: 1, total_spent: 63.82, avg_order_value: 63.82,
      total_items: 1, avg_review_score: 5.0, preferred_payment_type: "voucher",
      distinct_categories: 1
    },
    orders: [
      { order_id: "6d983186ed41c01b43e558f2d7a68010", purchase_date: new Date("2017-12-07T09:02:01Z"), status: "delivered", total_value: 63.82, items_count: 1, review_score: 5 }
    ],
    segments: ["one_time_buyer", "high_satisfaction"],
    location: { state: "MT", city: "sinop" }
  },
  {
    customer_unique_id: "unique_customer_001",
    period: "2018-Q1",
    metrics: {
      total_orders: 2, total_spent: 220.50, avg_order_value: 110.25,
      total_items: 3, avg_review_score: 3.5, preferred_payment_type: "credit_card",
      distinct_categories: 3
    },
    orders: [
      { order_id: "aa1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c", purchase_date: new Date("2018-03-15T14:22:00Z"), status: "delivered", total_value: 130.50, items_count: 2, review_score: 4 },
      { order_id: "ff6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", purchase_date: new Date("2018-03-22T11:00:00Z"), status: "delivered", total_value: 90.00, items_count: 1, review_score: 3 }
    ],
    segments: ["returning_customer", "medium_value"],
    location: { state: "RJ", city: "rio de janeiro" }
  },
  {
    customer_unique_id: "unique_customer_002",
    period: "2018-Q2",
    metrics: {
      total_orders: 2, total_spent: 860.00, avg_order_value: 430.00,
      total_items: 2, avg_review_score: 3.0, preferred_payment_type: "credit_card",
      distinct_categories: 2
    },
    orders: [
      { order_id: "bb2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", purchase_date: new Date("2018-04-10T08:15:00Z"), status: "delivered", total_value: 515.00, items_count: 1, review_score: 2 },
      { order_id: "hh8h9a0b1c2d3e4f5a6b7c8d9e0f1a2b", purchase_date: new Date("2018-04-01T07:30:00Z"), status: "delivered", total_value: 345.00, items_count: 1, review_score: 4 }
    ],
    segments: ["returning_customer", "high_value"],
    location: { state: "MG", city: "belo horizonte" }
  },
  {
    customer_unique_id: "unique_customer_005",
    period: "2018-Q1",
    metrics: {
      total_orders: 1, total_spent: 83.00, avg_order_value: 83.00,
      total_items: 3, avg_review_score: 5.0, preferred_payment_type: "credit_card",
      distinct_categories: 3
    },
    orders: [
      { order_id: "ee5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a", purchase_date: new Date("2018-01-20T16:45:00Z"), status: "delivered", total_value: 83.00, items_count: 3, review_score: 5 }
    ],
    segments: ["one_time_buyer", "high_satisfaction", "multi_category"],
    location: { state: "SP", city: "campinas" }
  },
  {
    customer_unique_id: "unique_customer_006",
    period: "2018-Q2",
    metrics: {
      total_orders: 1, total_spent: 147.00, avg_order_value: 147.00,
      total_items: 1, avg_review_score: 2.0, preferred_payment_type: "boleto",
      distinct_categories: 1
    },
    orders: [
      { order_id: "gg7g8a9b0c1d2e3f4a5b6c7d8e9f0a1b", purchase_date: new Date("2018-05-05T20:00:00Z"), status: "delivered", total_value: 147.00, items_count: 1, review_score: 2 }
    ],
    segments: ["one_time_buyer", "low_satisfaction"],
    location: { state: "SP", city: "sao paulo" }
  }
]);

print("✅ 6 documentos insertados en user_behavior");

// ---------------------------------------------------------------------------
// DATOS: geo_sales_summary (10 registros)
// ---------------------------------------------------------------------------

db.geo_sales_summary.insertMany([
  {
    state: "SP", city: null, period: "2018-01",
    metrics: { total_orders: 1, total_items: 3, gross_revenue: 65.00, freight_revenue: 18.00, avg_order_value: 83.00, unique_customers: 1, unique_sellers: 2 },
    delivery: { avg_delivery_days: 10, on_time_rate: 1.0, avg_estimated_days: 21 },
    reviews: { avg_score: 5.0, total_reviews: 1, negative_rate: 0.0 },
    top_categories: [
      { category: "toys", revenue: 30.00, orders: 1 },
      { category: "books_general_interest", revenue: 25.00, orders: 1 },
      { category: "stationery", revenue: 10.00, orders: 1 }
    ]
  },
  {
    state: "RJ", city: null, period: "2018-03",
    metrics: { total_orders: 2, total_items: 3, gross_revenue: 185.00, freight_revenue: 35.50, avg_order_value: 110.25, unique_customers: 1, unique_sellers: 3 },
    delivery: { avg_delivery_days: 12, on_time_rate: 1.0, avg_estimated_days: 21.5 },
    reviews: { avg_score: 3.5, total_reviews: 2, negative_rate: 0.0 },
    top_categories: [
      { category: "computers_accessories", revenue: 80.00, orders: 1 },
      { category: "bed_bath_table", revenue: 75.00, orders: 1 },
      { category: "telephony", revenue: 30.00, orders: 1 }
    ]
  },
  {
    state: "MG", city: null, period: "2018-04",
    metrics: { total_orders: 2, total_items: 2, gross_revenue: 750.00, freight_revenue: 110.00, avg_order_value: 430.00, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 12, on_time_rate: 0.5, avg_estimated_days: 14.5 },
    reviews: { avg_score: 3.0, total_reviews: 2, negative_rate: 0.5 },
    top_categories: [
      { category: "furniture_decor", revenue: 450.00, orders: 1 },
      { category: "garden_tools", revenue: 300.00, orders: 1 }
    ]
  },
  {
    state: "SP", city: null, period: "2018-05",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 125.00, freight_revenue: 22.00, avg_order_value: 147.00, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 10, on_time_rate: 1.0, avg_estimated_days: 20 },
    reviews: { avg_score: 2.0, total_reviews: 1, negative_rate: 1.0 },
    top_categories: [
      { category: "auto", revenue: 125.00, orders: 1 }
    ]
  },
  {
    state: "SP", city: null, period: "2018-08",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 22.99, freight_revenue: 7.42, avg_order_value: 30.41, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 9, on_time_rate: 1.0, avg_estimated_days: 24 },
    reviews: { avg_score: 1.0, total_reviews: 1, negative_rate: 1.0 },
    top_categories: [
      { category: "sports_leisure", revenue: 22.99, orders: 1 }
    ]
  },
  {
    state: "MT", city: null, period: "2017-12",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 45.90, freight_revenue: 17.92, avg_order_value: 63.82, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 19, on_time_rate: 1.0, avg_estimated_days: 34 },
    reviews: { avg_score: 5.0, total_reviews: 1, negative_rate: 0.0 },
    top_categories: [
      { category: "perfumery", revenue: 45.90, orders: 1 }
    ]
  },
  {
    state: "SP", city: null, period: "2017-06",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 62.99, freight_revenue: 19.68, avg_order_value: 82.67, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 13, on_time_rate: 1.0, avg_estimated_days: 31 },
    reviews: { avg_score: 4.0, total_reviews: 1, negative_rate: 0.0 },
    top_categories: [
      { category: "cool_stuff", revenue: 62.99, orders: 1 }
    ]
  },
  {
    state: "SP", city: null, period: "2017-07",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 19.99, freight_revenue: 7.78, avg_order_value: 27.77, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: 5, on_time_rate: 1.0, avg_estimated_days: 27 },
    reviews: { avg_score: 5.0, total_reviews: 1, negative_rate: 0.0 },
    top_categories: [
      { category: "health_beauty", revenue: 19.99, orders: 1 }
    ]
  },
  {
    state: "BA", city: null, period: "2018-05",
    metrics: { total_orders: 1, total_items: 2, gross_revenue: 310.00, freight_revenue: 40.00, avg_order_value: 350.00, unique_customers: 1, unique_sellers: 2 },
    delivery: { avg_delivery_days: null, on_time_rate: null, avg_estimated_days: 16 },
    reviews: { avg_score: null, total_reviews: 0, negative_rate: null },
    top_categories: [
      { category: "electronics", revenue: 300.00, orders: 1 },
      { category: "stationery", revenue: 10.00, orders: 1 }
    ]
  },
  {
    state: "RS", city: null, period: "2018-02",
    metrics: { total_orders: 1, total_items: 1, gross_revenue: 150.00, freight_revenue: 18.00, avg_order_value: 168.00, unique_customers: 1, unique_sellers: 1 },
    delivery: { avg_delivery_days: null, on_time_rate: null, avg_estimated_days: 15 },
    reviews: { avg_score: null, total_reviews: 0, negative_rate: null },
    top_categories: [
      { category: "watches_gifts", revenue: 150.00, orders: 1 }
    ]
  }
]);

print("✅ 10 documentos insertados en geo_sales_summary");
print("========================================");
print("✅ CARGA DE DATOS COMPLETA");
print("Colecciones: product_catalog(15), order_analytics(12), reviews_analytics(10), user_behavior(6), geo_sales_summary(10)");

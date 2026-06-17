// ============================================================================
// Script MongoDB (mongosh) — Ecommify / Olist
// Consultas, Aggregation Pipelines Optimizados e Índices
// Equipo E03 — Universidad de la Sabana — Unidad 5
// ============================================================================

use("ecommify_analytics_v1");

// ============================================================================
//  ÍNDICES CON JUSTIFICACIÓN TÉCNICA
// ============================================================================

// ---------------------------------------------------------------------------
//  1 Índices sobre product_catalog
// ---------------------------------------------------------------------------

// Índice único sobre product_id (equivalente a PK relacional).
db.product_catalog.createIndex(
  { product_id: 1 },
  { unique: true, name: "idx_product_id_unique" }
);

// Índice compuesto para búsqueda por categoría y ordenamiento por revenue.
// Justificación: La consulta más frecuente sobre catálogo es buscar productos
// por categoría y ordenar por ventas. Este índice cubre ambas operaciones.
db.product_catalog.createIndex(
  { "category.name_en": 1, "sales_summary.total_revenue": -1 },
  { name: "idx_category_revenue" }
);

// Índice parcial para productos pesados (>5000g).
// Justificación: Equivalente a la Consulta 12 de PostgreSQL. El índice parcial
// reduce el tamaño del índice y acelera filtros sobre peso.
db.product_catalog.createIndex(
  { "physical_attributes.weight_g": -1 },
  {
    name: "idx_heavy_products",
    partialFilterExpression: { "physical_attributes.weight_g": { $gt: 5000 } }
  }
);

// Índice compuesto para análisis de reseñas por producto.
db.product_catalog.createIndex(
  { "review_summary.avg_score": 1, "review_summary.reviews_count": -1 },
  { name: "idx_review_analysis" }
);

// Índice de texto para búsqueda textual en categorías.
// Justificación: Permite búsquedas flexibles similares a pg_trgm en PostgreSQL.
db.product_catalog.createIndex(
  { "category.name": "text", "category.name_en": "text" },
  { name: "idx_category_text_search" }
);

print("✅ 5 índices creados en product_catalog");

// ---------------------------------------------------------------------------
// 2 Índices sobre order_analytics
// ---------------------------------------------------------------------------

// Índice único sobre order_id.
db.order_analytics.createIndex(
  { order_id: 1 },
  { unique: true, name: "idx_order_id_unique" }
);

// Índice compuesto para consultas por estado del cliente y fecha.
// Justificación: Equivalente a la Consulta 14 de PostgreSQL (ranking de ventas
// por estado y ciudad). Cubre filtros geográficos y temporales.
db.order_analytics.createIndex(
  { "customer.state": 1, purchase_timestamp: -1 },
  { name: "idx_customer_state_date" }
);

// Índice sobre status y fecha para consultas operativas.
db.order_analytics.createIndex(
  { status: 1, purchase_timestamp: -1 },
  { name: "idx_status_date" }
);

// Índice sobre tipo de pago para análisis de pagos.
// Justificación: Equivalente a la Consulta 7 de PostgreSQL.
db.order_analytics.createIndex(
  { "payments.type": 1, "payments.installments": 1 },
  { name: "idx_payment_type_installments" }
);

// Índice parcial para reseñas negativas (score <= 2).
// Justificación: Equivalente a la Consulta 5 de PostgreSQL (reseñas negativas).
db.order_analytics.createIndex(
  { "review.score": 1, purchase_timestamp: -1 },
  {
    name: "idx_negative_reviews",
    partialFilterExpression: {
      "review.score": { $lte: 2 },
      "review.message": { $type: "string" }
    }
  }
);

// Índice para análisis logístico (entregas tardías).
db.order_analytics.createIndex(
  { "logistics.on_time": 1, status: 1 },
  { name: "idx_logistics_ontime" }
);

print("✅ 6 índices creados en order_analytics");

// ---------------------------------------------------------------------------
// 3 Índices sobre reviews_analytics
// ---------------------------------------------------------------------------

db.reviews_analytics.createIndex(
  { review_id: 1 },
  { unique: true, name: "idx_review_id_unique" }
);

// Índice compuesto para filtro por score y fecha.
// Justificación: Equivalente a la Consulta 10 de PostgreSQL.
db.reviews_analytics.createIndex(
  { review_score: 1, creation_date: -1 },
  { name: "idx_score_date" }
);

// Índice sobre categorías de productos para análisis cruzado.
db.reviews_analytics.createIndex(
  { product_categories: 1, review_score: 1 },
  { name: "idx_categories_score" }
);

// Índice sobre estado del cliente para análisis geográfico.
db.reviews_analytics.createIndex(
  { "customer.state": 1, review_score: 1 },
  { name: "idx_customer_state_score" }
);

// Índice parcial para reseñas negativas con mensaje.
db.reviews_analytics.createIndex(
  { review_score: 1, order_id: 1 },
  {
    name: "idx_negative_reviews_with_message",
    partialFilterExpression: {
      review_score: { $lte: 2 },
      "text.message": { $exists: true }
    }
  }
);

print("✅ 5 índices creados en reviews_analytics");

// ---------------------------------------------------------------------------
// 4 Índices sobre user_behavior
// ---------------------------------------------------------------------------

db.user_behavior.createIndex(
  { customer_unique_id: 1, period: 1 },
  { unique: true, name: "idx_customer_period_unique" }
);

db.user_behavior.createIndex(
  { segments: 1, "metrics.total_spent": -1 },
  { name: "idx_segments_spent" }
);

print("✅ 2 índices creados en user_behavior");

// ---------------------------------------------------------------------------
// 5 Índices sobre geo_sales_summary
// ---------------------------------------------------------------------------

db.geo_sales_summary.createIndex(
  { state: 1, period: 1 },
  { name: "idx_state_period" }
);

db.geo_sales_summary.createIndex(
  { "metrics.gross_revenue": -1 },
  { name: "idx_gross_revenue_desc" }
);

print("✅ 2 índices creados en geo_sales_summary");
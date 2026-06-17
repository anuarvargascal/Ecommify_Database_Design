// ============================================================================
// PARTE A : AGGREGATION PIPELINES OPTIMIZADOS
// Equivalentes a las 5 consultas críticas de PostgreSQL
// ============================================================================
use("ecommify_analytics_v1");
// ---------------------------------------------------------------------------
// A.1 Pipeline equivalente a Consulta 14:
//     Ranking de ventas por estado y ciudad del cliente
//     PostgreSQL: JOIN orders + customers + geolocation + order_items
//     MongoDB: Datos ya desnormalizados en order_analytics
// ---------------------------------------------------------------------------

print("\n📊 PIPELINE 1: Ranking de ventas por estado y ciudad del cliente");
print("Equivalente a Consulta 14 PostgreSQL (reducción 69,11% en PG)");
print("---");

var pipeline1 = [
  // Etapa 1: Filtrar solo pedidos con estado relevante (delivered/shipped)
  { $match: { status: { $in: ["delivered", "shipped"] } } },

  // Etapa 2: Desenrollar ítems para calcular revenue por ítem
  { $unwind: "$items" },

  // Etapa 3: Agrupar por estado y ciudad del cliente
  { $group: {
      _id: {
        state: "$customer.state",
        city: "$customer.city"
      },
      orders: { $addToSet: "$order_id" },
      items: { $sum: 1 },
      gross_product_revenue: { $sum: "$items.price" },
      freight_revenue: { $sum: "$items.freight_value" }
  }},

  // Etapa 4: Proyectar formato final
  { $project: {
      _id: 0,
      state: "$_id.state",
      city: "$_id.city",
      orders: { $size: "$orders" },
      items: 1,
      gross_product_revenue: { $round: ["$gross_product_revenue", 2] },
      freight_revenue: { $round: ["$freight_revenue", 2] }
  }},

  // Etapa 5: Ordenar por revenue descendente
  { $sort: { gross_product_revenue: -1 } },

  // Etapa 6: Limitar a top 100
  { $limit: 100 }
];

// Ejecutar con .explain() para métricas ANTES de índice
print("Resultado del pipeline:");
db.order_analytics.aggregate(pipeline1).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// A.2 Pipeline equivalente a Consulta 5:
//     Reseñas negativas con contenido y detalle
//     PostgreSQL: JOIN reviews + orders + customers + items + products
//     MongoDB: Datos embebidos en order_analytics
// ---------------------------------------------------------------------------

print("\n📊 PIPELINE 2: Reseñas negativas con contenido y detalle");
print("Equivalente a Consulta 5 PostgreSQL (reducción 50,06% en PG)");
print("---");

var pipeline2 = [
  // Etapa 1: Filtrar reseñas negativas con mensaje
  { $match: {
      "review.score": { $lte: 2 },
      "review.message": { $exists: true, $ne: null }
  }},

  // Etapa 2: Desenrollar ítems para obtener detalle de productos
  { $unwind: "$items" },

  // Etapa 3: Proyectar campos equivalentes a la consulta SQL
  { $project: {
      _id: 0,
      review_id: "$review.review_id",
      order_id: 1,
      review_score: "$review.score",
      review_message: "$review.message",
      order_status: "$status",
      order_purchase_timestamp: "$purchase_timestamp",
      customer_unique_id: "$customer.customer_unique_id",
      product_id: "$items.product_id",
      product_category: "$items.product_category"
  }},

  // Etapa 4: Ordenar por score ASC, fecha DESC
  { $sort: { review_score: 1, order_purchase_timestamp: -1 } }
];

print("Resultado del pipeline:");
db.order_analytics.aggregate(pipeline2).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// A.3 Pipeline equivalente a Consulta 10:
//     Reseñas negativas/medias por estado y categoría en ventana temporal
//     PostgreSQL: JOIN con filtro TSTZRANGE && y review_score <= 3
//     MongoDB: Filtro equivalente con $match por fechas y score
// ---------------------------------------------------------------------------

print("\n📊 PIPELINE 3: Reseñas negativas/medias por estado y categoría (ventana temporal)");
print("Equivalente a Consulta 10 PostgreSQL (reducción 26,34% en PG)");
print("---");

var pipeline3 = [
  // Etapa 1: Filtrar por ventana temporal y score
  { $match: {
      review_score: { $lte: 3 },
      creation_date: {
        $gte: new Date("2018-03-01T00:00:00Z"),
        $lt: new Date("2018-06-01T00:00:00Z")
      }
  }},

  // Etapa 2: Desenrollar categorías de productos
  { $unwind: "$product_categories" },

  // Etapa 3: Agrupar por estado del cliente y categoría
  { $group: {
      _id: {
        customer_state: "$customer.state",
        category: "$product_categories"
      },
      reviews: { $addToSet: "$review_id" },
      orders: { $addToSet: "$order_id" },
      avg_review_score: { $avg: "$review_score" },
      first_review_creation: { $min: "$creation_date" },
      last_review_answer: { $max: "$answer_date" }
  }},

  // Etapa 4: Proyectar formato final
  { $project: {
      _id: 0,
      customer_state: "$_id.customer_state",
      category: "$_id.category",
      reviews: { $size: "$reviews" },
      orders: { $size: "$orders" },
      avg_review_score: { $round: ["$avg_review_score", 2] },
      first_review_creation: 1,
      last_review_answer: 1
  }},

  // Etapa 5: Ordenar por cantidad de reseñas DESC, score ASC
  { $sort: { reviews: -1, avg_review_score: 1 } }
];

print("Resultado del pipeline:");
db.reviews_analytics.aggregate(pipeline3).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// A.4 Pipeline equivalente a Consulta 12:
//     Productos con peso superior a 5.000g
//     PostgreSQL: Filtro JSONB con cast numeric
//     MongoDB: Acceso directo al campo numérico (sin necesidad de cast)
// ---------------------------------------------------------------------------

print("\n📊 PIPELINE 4: Productos con peso > 5.000g");
print("Equivalente a Consulta 12 PostgreSQL (reducción 98,12% en PG)");
print("---");

var pipeline4 = [
  // Etapa 1: Filtrar por peso (aprovecha índice parcial idx_heavy_products)
  { $match: { "physical_attributes.weight_g": { $gt: 5000 } } },

  // Etapa 2: Proyectar campos equivalentes
  { $project: {
      _id: 0,
      product_id: 1,
      category: "$category.name_en",
      weight_g: "$physical_attributes.weight_g",
      length_cm: "$physical_attributes.dimensions_cm.length",
      height_cm: "$physical_attributes.dimensions_cm.height",
      width_cm: "$physical_attributes.dimensions_cm.width"
  }},

  // Etapa 3: Ordenar por peso DESC
  { $sort: { weight_g: -1 } },

  // Etapa 4: Limitar a 100
  { $limit: 100 }
];

print("Resultado del pipeline:");
db.product_catalog.aggregate(pipeline4).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// A.5 Pipeline equivalente a Consulta 7:
//     Análisis de pagos por tipo y cuotas
//     PostgreSQL: GROUP BY payment_type, payment_installments
//     MongoDB: $unwind payments + $group
// ---------------------------------------------------------------------------

print("\n📊 PIPELINE 5: Análisis de pagos por tipo y cuotas");
print("Equivalente a Consulta 7 PostgreSQL (reducción 84,97% en PG)");
print("---");

var pipeline5 = [
  // Etapa 1: Desenrollar pagos
  { $unwind: "$payments" },

  // Etapa 2: Agrupar por tipo de pago y cuotas
  { $group: {
      _id: {
        payment_type: "$payments.type",
        payment_installments: "$payments.installments"
      },
      payment_records: { $sum: 1 },
      orders: { $addToSet: "$order_id" },
      payment_value: { $sum: "$payments.value" }
  }},

  // Etapa 3: Calcular métricas derivadas
  { $project: {
      _id: 0,
      payment_type: "$_id.payment_type",
      payment_installments: "$_id.payment_installments",
      payment_records: 1,
      orders: { $size: "$orders" },
      payment_value: { $round: ["$payment_value", 2] },
      avg_payment_value: {
        $round: [{ $divide: ["$payment_value", { $max: ["$payment_records", 1] }] }, 2]
      }
  }},

  // Etapa 4: Ordenar por valor total DESC
  { $sort: { payment_value: -1 } }
];

print("Resultado del pipeline:");
db.order_analytics.aggregate(pipeline5).forEach(doc => printjson(doc));

// ============================================================================
// PARTE B : CONSULTAS COMPLEJAS ADICIONALES
// ============================================================================

// ---------------------------------------------------------------------------
// B.1 Análisis de comportamiento de clientes con $lookup
//     Correlaciona user_behavior con reviews_analytics
// ---------------------------------------------------------------------------

print("\n📊 CONSULTA COMPLEJA 1: Comportamiento vs. Satisfacción con $lookup");

var pipelineLookup = [
  { $match: { segments: "low_satisfaction" } },
  { $lookup: {
      from: "reviews_analytics",
      localField: "customer_unique_id",
      foreignField: "customer.customer_unique_id",
      as: "detailed_reviews"
  }},
  { $project: {
      _id: 0,
      customer_unique_id: 1,
      period: 1,
      total_spent: "$metrics.total_spent",
      avg_review_score: "$metrics.avg_review_score",
      segments: 1,
      negative_reviews: {
        $filter: {
          input: "$detailed_reviews",
          as: "rev",
          cond: { $lte: ["$$rev.review_score", 2] }
        }
      }
  }},
  { $addFields: {
      negative_review_count: { $size: "$negative_reviews" },
      negative_reasons: {
        $map: {
          input: "$negative_reviews",
          as: "rev",
          in: "$$rev.text.message"
        }
      }
  }}
];

print("Resultado:");
db.user_behavior.aggregate(pipelineLookup).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// B.2 Pipeline con $facet para dashboard multi-métrica
//     Genera múltiples vistas en una sola consulta
// ---------------------------------------------------------------------------

print("\n📊 CONSULTA COMPLEJA 2: Dashboard multi-métrica con $facet");

var pipelineFacet = [
  { $facet: {
      // Vista 1: Distribución de scores
      score_distribution: [
        { $group: {
            _id: "$review_score",
            count: { $sum: 1 },
            avg_response_hours: { $avg: "$response_time_hours" }
        }},
        { $sort: { _id: 1 } }
      ],
      // Vista 2: Top categorías con peor satisfacción
      worst_categories: [
        { $unwind: "$product_categories" },
        { $group: {
            _id: "$product_categories",
            avg_score: { $avg: "$review_score" },
            reviews_count: { $sum: 1 }
        }},
        { $match: { reviews_count: { $gte: 1 } } },
        { $sort: { avg_score: 1 } },
        { $limit: 5 }
      ],
      // Vista 3: Reseñas por estado
      by_state: [
        { $group: {
            _id: "$customer.state",
            avg_score: { $avg: "$review_score" },
            total: { $sum: 1 }
        }},
        { $sort: { total: -1 } }
      ]
  }}
];

print("Resultado:");
db.reviews_analytics.aggregate(pipelineFacet).forEach(doc => printjson(doc));

// ---------------------------------------------------------------------------
// B.3 Pipeline de tendencia temporal con $bucket
//     Agrupa pedidos por rangos de valor
// ---------------------------------------------------------------------------

print("\n📊 CONSULTA COMPLEJA 3: Distribución de pedidos por rango de valor");

var pipelineBucket = [
  { $bucket: {
      groupBy: "$totals.total_payment",
      boundaries: [0, 50, 100, 200, 500, 1000],
      default: "1000+",
      output: {
        count: { $sum: 1 },
        avg_items: { $avg: "$totals.items_count" },
        avg_review_score: { $avg: "$review.score" },
        orders: { $push: "$order_id" }
      }
  }}
];

print("Resultado:");
db.order_analytics.aggregate(pipelineBucket).forEach(doc => printjson(doc));

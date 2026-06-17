// ============================================================================
// Script MongoDB (mongosh) — Ecommify / Olist
// Módulo Analítico: Colecciones, JSON Schema Validation, Datos e Índices
// Equipo E03 — Universidad de la Sabana — Unidad 5
// ============================================================================

// ---------------------------------------------------------------------------
// 0. Conexión y creación de base de datos
// ---------------------------------------------------------------------------
// En MongoDB Atlas free tier (M0), conectarse con:
//   mongosh "mongodb+srv://<cluster>.mongodb.net/" --apiVersion 1 --username <user>

use("ecommify_analytics_v1");

// ---------------------------------------------------------------------------
// 1. COLECCIÓN: product_catalog
//    Patrón principal: Embedded Document + Computed Pattern + Subset Pattern
//    Justificación: El catálogo de productos es un caso clásico de lectura
//    intensiva. Se embeben categoría, especificaciones, resumen de ventas y
//    resumen de reseñas para evitar $lookup en consultas frecuentes.
//    El patrón Attribute se aplica en physical_attributes para atributos
//    variables por producto.
// ---------------------------------------------------------------------------

db.createCollection("product_catalog", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_id", "category", "physical_attributes"],
      properties: {
        product_id: {
          bsonType: "string",
          description: "Identificador único del producto (32 caracteres hex)"
        },
        category: {
          bsonType: "object",
          required: ["name"],
          properties: {
            name: { bsonType: "string", description: "Categoría original en portugués" },
            name_en: { bsonType: "string", description: "Categoría traducida al inglés" }
          },
          description: "Categoría embebida — Extended Reference Pattern"
        },
        descriptive_attributes: {
          bsonType: "object",
          properties: {
            name_length: { bsonType: "int", minimum: 0 },
            description_length: { bsonType: "int", minimum: 0 },
            photos_qty: { bsonType: "int", minimum: 0 }
          },
          description: "Atributos descriptivos del producto — Attribute Pattern"
        },
        physical_attributes: {
          bsonType: "object",
          required: ["weight_g"],
          properties: {
            weight_g: { bsonType: "int", minimum: 0, description: "Peso en gramos" },
            dimensions_cm: {
              bsonType: "object",
              properties: {
                length: { bsonType: "int", minimum: 0 },
                height: { bsonType: "int", minimum: 0 },
                width: { bsonType: "int", minimum: 0 }
              }
            },
            volume_cm3: { bsonType: "int", minimum: 0 }
          },
          description: "Atributos físicos — Attribute Pattern para dimensiones variables"
        },
        sales_summary: {
          bsonType: "object",
          properties: {
            orders_count: { bsonType: "int", minimum: 0 },
            items_sold: { bsonType: "int", minimum: 0 },
            total_revenue: { bsonType: "double", minimum: 0 },
            avg_price: { bsonType: "double", minimum: 0 }
          },
          description: "Métricas pre-calculadas — Computed Pattern"
        },
        review_summary: {
          bsonType: "object",
          properties: {
            avg_score: { bsonType: "double", minimum: 1, maximum: 5 },
            reviews_count: { bsonType: "int", minimum: 0 },
            score_distribution: {
              bsonType: "object",
              description: "Distribución de calificaciones: {1: n, 2: n, ...}"
            }
          },
          description: "Resumen de reseñas — Subset Pattern (solo métricas, no texto)"
        },
        sellers: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              seller_id: { bsonType: "string" },
              state: { bsonType: "string" }
            }
          },
          description: "Vendedores asociados — Extended Reference (solo id y estado)"
        },
        _sync: {
          bsonType: "object",
          properties: {
            source: { bsonType: "string" },
            synced_at: { bsonType: "date" },
            batch_id: { bsonType: "string" }
          },
          description: "Metadatos de sincronización ETL"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ---------------------------------------------------------------------------
// 2. COLECCIÓN: order_analytics
//    Patrón principal: Embedded Document (ítems, pagos, reseña)
//    Justificación: El pedido consolidado es el documento analítico central.
//    Se embeben ítems, pagos y reseña para evitar joins analíticos.
//    Patrón Outlier: si un pedido tuviera >50 ítems, se referenciarían.
//    Extended Reference: cliente con solo id, unique_id y estado.
// ---------------------------------------------------------------------------

db.createCollection("order_analytics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "status", "customer", "purchase_timestamp"],
      properties: {
        order_id: { bsonType: "string" },
        status: {
          bsonType: "string",
          enum: ["created","approved","invoiced","processing","shipped","delivered","unavailable","canceled"]
        },
        purchase_timestamp: { bsonType: "date" },
        approved_at: { bsonType: ["date", "null"] },
        delivered_carrier_date: { bsonType: ["date", "null"] },
        delivered_customer_date: { bsonType: ["date", "null"] },
        estimated_delivery_date: { bsonType: "date" },
        customer: {
          bsonType: "object",
          required: ["customer_id"],
          properties: {
            customer_id: { bsonType: "string" },
            customer_unique_id: { bsonType: "string" },
            state: { bsonType: "string" },
            city: { bsonType: "string" },
            zip_code_prefix: { bsonType: "int" }
          },
          description: "Cliente embebido — Extended Reference Pattern"
        },
        items: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["product_id", "seller_id", "price"],
            properties: {
              order_item_id: { bsonType: "int" },
              product_id: { bsonType: "string" },
              product_category: { bsonType: "string" },
              seller_id: { bsonType: "string" },
              seller_state: { bsonType: "string" },
              price: { bsonType: "double", minimum: 0 },
              freight_value: { bsonType: "double", minimum: 0 },
              shipping_limit_date: { bsonType: "date" }
            }
          },
          description: "Ítems embebidos — Embedded Document Pattern"
        },
        payments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              sequential: { bsonType: "int" },
              type: {
                bsonType: "string",
                enum: ["credit_card","boleto","voucher","debit_card","not_defined"]
              },
              installments: { bsonType: "int", minimum: 0 },
              value: { bsonType: "double", minimum: 0 }
            }
          },
          description: "Pagos embebidos — Embedded Document Pattern"
        },
        review: {
          bsonType: "object",
          properties: {
            review_id: { bsonType: "string" },
            score: { bsonType: "int", minimum: 1, maximum: 5 },
            title: { bsonType: ["string", "null"] },
            message: { bsonType: ["string", "null"] },
            creation_date: { bsonType: ["date", "null"] },
            answer_date: { bsonType: ["date", "null"] },
            tags: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          },
          description: "Reseña embebida — Subset Pattern (una por pedido)"
        },
        totals: {
          bsonType: "object",
          properties: {
            items_count: { bsonType: "int" },
            total_product_value: { bsonType: "double" },
            total_freight: { bsonType: "double" },
            total_payment: { bsonType: "double" }
          },
          description: "Totales pre-calculados — Computed Pattern"
        },
        logistics: {
          bsonType: "object",
          properties: {
            delivery_days: { bsonType: ["int", "null"] },
            estimated_days: { bsonType: ["int", "null"] },
            on_time: { bsonType: ["bool", "null"] }
          },
          description: "Métricas logísticas derivadas — Computed Pattern"
        },
        has_overflow: {
          bsonType: "bool",
          description: "Indicador Outlier Pattern: true si ítems fueron truncados"
        },
        _sync: {
          bsonType: "object",
          properties: {
            source: { bsonType: "string" },
            synced_at: { bsonType: "date" }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ---------------------------------------------------------------------------
// 3. COLECCIÓN: reviews_analytics
//    Patrón principal: Reference Pattern (product_ids, seller_ids)
//    Justificación: Las reseñas enriquecidas contienen texto, tags y
//    referencias a múltiples productos/vendedores del pedido. Se referencian
//    en lugar de embeber para evitar duplicación.
// ---------------------------------------------------------------------------

db.createCollection("reviews_analytics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["review_id", "order_id", "review_score"],
      properties: {
        review_id: { bsonType: "string" },
        order_id: { bsonType: "string" },
        review_score: { bsonType: "int", minimum: 1, maximum: 5 },
        text: {
          bsonType: "object",
          properties: {
            title: { bsonType: ["string", "null"] },
            message: { bsonType: ["string", "null"] }
          }
        },
        tags: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Etiquetas derivadas: positive, negative, with_message, fast_response, etc."
        },
        response_time_hours: {
          bsonType: ["double", "null"],
          description: "Horas entre creación y respuesta"
        },
        creation_date: { bsonType: ["date", "null"] },
        answer_date: { bsonType: ["date", "null"] },
        product_ids: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Referencias a productos — Reference Pattern"
        },
        product_categories: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Categorías de productos del pedido"
        },
        seller_ids: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Referencias a vendedores — Reference Pattern"
        },
        customer: {
          bsonType: "object",
          properties: {
            customer_unique_id: { bsonType: "string" },
            state: { bsonType: "string" }
          },
          description: "Referencia mínima al cliente — Extended Reference"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ---------------------------------------------------------------------------
// 4. COLECCIÓN: user_behavior
//    Patrón principal: Bucket Pattern (eventos agrupados por período)
//    Justificación: El comportamiento de usuario es derivado y
//    semiestructurado. Se agrupan eventos por customer_unique_id y período
//    para controlar el crecimiento del documento.
// ---------------------------------------------------------------------------

db.createCollection("user_behavior", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customer_unique_id", "period"],
      properties: {
        customer_unique_id: { bsonType: "string" },
        period: {
          bsonType: "string",
          description: "Período del bucket: YYYY-MM o YYYY-Q1, etc."
        },
        metrics: {
          bsonType: "object",
          properties: {
            total_orders: { bsonType: "int", minimum: 0 },
            total_spent: { bsonType: "double", minimum: 0 },
            avg_order_value: { bsonType: "double", minimum: 0 },
            total_items: { bsonType: "int", minimum: 0 },
            avg_review_score: { bsonType: ["double", "null"] },
            preferred_payment_type: { bsonType: ["string", "null"] },
            distinct_categories: { bsonType: "int", minimum: 0 }
          },
          description: "Métricas agregadas — Computed Pattern"
        },
        orders: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              order_id: { bsonType: "string" },
              purchase_date: { bsonType: "date" },
              status: { bsonType: "string" },
              total_value: { bsonType: "double" },
              items_count: { bsonType: "int" },
              review_score: { bsonType: ["int", "null"] }
            }
          },
          description: "Pedidos del período — Bucket Pattern"
        },
        segments: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Segmentos derivados: new_customer, returning, high_value, etc."
        },
        location: {
          bsonType: "object",
          properties: {
            state: { bsonType: "string" },
            city: { bsonType: "string" }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ---------------------------------------------------------------------------
// 5. COLECCIÓN: geo_sales_summary
//    Patrón principal: Computed Pattern + Bucket Pattern por estado/ciudad
//    Justificación: Agregados geográficos pre-calculados para dashboards.
//    Se evita recalcular en cada consulta.
// ---------------------------------------------------------------------------

db.createCollection("geo_sales_summary", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["state", "period"],
      properties: {
        state: { bsonType: "string", description: "Estado federativo (2 caracteres)" },
        city: { bsonType: ["string", "null"] },
        period: { bsonType: "string", description: "Período: YYYY-MM" },
        metrics: {
          bsonType: "object",
          properties: {
            total_orders: { bsonType: "int", minimum: 0 },
            total_items: { bsonType: "int", minimum: 0 },
            gross_revenue: { bsonType: "double", minimum: 0 },
            freight_revenue: { bsonType: "double", minimum: 0 },
            avg_order_value: { bsonType: "double", minimum: 0 },
            unique_customers: { bsonType: "int", minimum: 0 },
            unique_sellers: { bsonType: "int", minimum: 0 }
          }
        },
        delivery: {
          bsonType: "object",
          properties: {
            avg_delivery_days: { bsonType: ["double", "null"] },
            on_time_rate: { bsonType: ["double", "null"] },
            avg_estimated_days: { bsonType: ["double", "null"] }
          }
        },
        reviews: {
          bsonType: "object",
          properties: {
            avg_score: { bsonType: ["double", "null"] },
            total_reviews: { bsonType: "int", minimum: 0 },
            negative_rate: { bsonType: ["double", "null"] }
          }
        },
        top_categories: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              category: { bsonType: "string" },
              revenue: { bsonType: "double" },
              orders: { bsonType: "int" }
            }
          },
          description: "Top categorías por estado/período — Subset Pattern"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

print("✅ 5 colecciones creadas con JSON Schema Validation");

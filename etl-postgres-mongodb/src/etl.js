require('dotenv').config();

const { obtenerPostgresPool, cerrarPostgres } = require('./db/postgres');
const { obtenerMongoDB, cerrarMongoDB } = require('./db/mongodb');
const { leerWatermark, escribirWatermark } = require('./utils/watermark');
const logger = require('./utils/logger');

// Umbral del patrón Outlier: si un pedido supera este número de ítems,
// se marca has_overflow = true (los ítems se truncarían en un diseño real).
const MAX_ITEMS_EMBEBIDOS = 50;

// ---------------------------------------------------------------------------
// Helpers de normalización
// ---------------------------------------------------------------------------

// Las columnas character(n) en PostgreSQL vienen con relleno de espacios.
// Esta función limpia strings y devuelve undefined si quedan vacíos.
function limpiarTexto(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }
  const texto = String(valor).trim();
  return texto.length > 0 ? texto : null;
}

// Convierte numeric/text de PostgreSQL a número (double) seguro.
function aNumero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }
  const numero = Number(valor);
  return Number.isNaN(numero) ? null : numero;
}

// Convierte a entero seguro.
function aEntero(valor) {
  const numero = aNumero(valor);
  return numero === null ? null : Math.trunc(numero);
}

// Convierte a Date o null.
function aFecha(valor) {
  if (!valor) {
    return null;
  }
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

// Diferencia en días contando solo la parte de fecha (UTC), como en el dataset.
function diferenciaEnDias(fechaInicio, fechaFin) {
  const inicio = aFecha(fechaInicio);
  const fin = aFecha(fechaFin);
  if (!inicio || !fin) {
    return null;
  }
  const inicioUTC = Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate());
  const finUTC = Date.UTC(fin.getUTCFullYear(), fin.getUTCMonth(), fin.getUTCDate());
  return Math.floor((finUTC - inicioUTC) / 86400000);
}

// Construye las etiquetas (tags) de una reseña a partir del score y el mensaje.
function construirTagsReview(score, mensaje, incluirScoreTag) {
  const tags = [];

  if (score >= 4) {
    tags.push('positive');
  } else if (score <= 2) {
    tags.push('negative');
  } else {
    tags.push('neutral');
  }

  if (limpiarTexto(mensaje)) {
    tags.push('with_message');
  }

  if (incluirScoreTag) {
    tags.push(`score_${score}`);
  }

  return tags;
}

// ---------------------------------------------------------------------------
// EXTRACT — Consultas a PostgreSQL (esquema ecommerce)
// ---------------------------------------------------------------------------

// Órdenes nuevas + cliente + geolocalización del cliente (city/state del ZIP).
async function obtenerOrdenesNuevas(pool, watermark) {
  const query = `
    SELECT
      o.order_id,
      o.customer_id,
      o.order_status,
      o.order_purchase_timestamp,
      o.order_approved_at,
      o.order_delivered_carrier_date,
      o.order_delivered_customer_date,
      o.order_estimated_delivery_date,
      c.customer_unique_id,
      c.customer_zip_code_prefix,
      g.city  AS customer_city,
      g.state AS customer_state
    FROM ecommerce.orders o
    INNER JOIN ecommerce.customers c
      ON c.customer_id = o.customer_id
    LEFT JOIN ecommerce.dim_geolocation_zip g
      ON g.zip_code_prefix = c.customer_zip_code_prefix
    WHERE o.order_purchase_timestamp > $1
    ORDER BY o.order_purchase_timestamp ASC
  `;

  const result = await pool.query(query, [watermark]);
  return result.rows;
}

// Ítems del pedido + categoría (en inglés) del producto + estado del vendedor.
async function obtenerItemsPorOrden(pool, orderId) {
  const query = `
    SELECT
      oi.order_item_id,
      oi.product_id,
      pc.product_category_name_english AS product_category,
      oi.seller_id,
      sg.state AS seller_state,
      oi.price,
      oi.freight_value,
      oi.shipping_limit_date
    FROM ecommerce.order_items oi
    LEFT JOIN ecommerce.products p
      ON p.product_id = oi.product_id
    LEFT JOIN ecommerce.product_categories pc
      ON pc.product_category_name = p.product_category_name
    LEFT JOIN ecommerce.sellers s
      ON s.seller_id = oi.seller_id
    LEFT JOIN ecommerce.dim_geolocation_zip sg
      ON sg.zip_code_prefix = s.seller_zip_code_prefix
    WHERE oi.order_id = $1
    ORDER BY oi.order_item_id ASC
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows;
}

// Pagos del pedido.
async function obtenerPagosPorOrden(pool, orderId) {
  const query = `
    SELECT
      payment_sequential,
      payment_type,
      payment_installments,
      payment_value
    FROM ecommerce.order_payments
    WHERE order_id = $1
    ORDER BY payment_sequential ASC
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows;
}

// Reseña del pedido. El contenido vive en JSONB (title/message) y el periodo
// de respuesta en un TSTZRANGE (lower = creación, upper = respuesta).
async function obtenerReviewPorOrden(pool, orderId) {
  const query = `
    SELECT
      review_id,
      review_score,
      review_content ->> 'title'   AS title,
      review_content ->> 'message' AS message,
      lower(review_response_period) AS creation_date,
      upper(review_response_period) AS answer_date
    FROM ecommerce.order_reviews
    WHERE order_id = $1
    ORDER BY lower(review_response_period) DESC NULLS LAST
    LIMIT 1
  `;

  const result = await pool.query(query, [orderId]);
  return result.rows[0] || null;
}

// ---------------------------------------------------------------------------
// TRANSFORM — Construcción de documentos para MongoDB
// ---------------------------------------------------------------------------

function transformarItems(filasItems) {
  return filasItems.map((fila) => ({
    order_item_id: aEntero(fila.order_item_id),
    product_id: limpiarTexto(fila.product_id),
    product_category: limpiarTexto(fila.product_category),
    seller_id: limpiarTexto(fila.seller_id),
    seller_state: limpiarTexto(fila.seller_state),
    price: aNumero(fila.price),
    freight_value: aNumero(fila.freight_value),
    shipping_limit_date: aFecha(fila.shipping_limit_date)
  }));
}

function transformarPagos(filasPagos) {
  return filasPagos.map((fila) => ({
    sequential: aEntero(fila.payment_sequential),
    type: limpiarTexto(fila.payment_type),
    installments: aEntero(fila.payment_installments),
    value: aNumero(fila.payment_value)
  }));
}

function transformarReviewEmbebida(filaReview) {
  if (!filaReview) {
    return null;
  }

  const score = aEntero(filaReview.review_score);
  const title = limpiarTexto(filaReview.title);
  const message = limpiarTexto(filaReview.message);

  return {
    review_id: limpiarTexto(filaReview.review_id),
    score,
    title,
    message,
    creation_date: aFecha(filaReview.creation_date),
    answer_date: aFecha(filaReview.answer_date),
    tags: construirTagsReview(score, message, false)
  };
}

function calcularTotales(items, pagos) {
  const totalProducto = items.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalFlete = items.reduce((acc, it) => acc + (it.freight_value || 0), 0);
  const totalPago = pagos.reduce((acc, p) => acc + (p.value || 0), 0);

  return {
    items_count: items.length,
    // Redondeo a 2 decimales para evitar ruido de coma flotante.
    total_product_value: Math.round(totalProducto * 100) / 100,
    total_freight: Math.round(totalFlete * 100) / 100,
    total_payment: Math.round(totalPago * 100) / 100
  };
}

function calcularLogistica(ordenBase) {
  const purchase = aFecha(ordenBase.order_purchase_timestamp);
  const delivered = aFecha(ordenBase.order_delivered_customer_date);
  const estimated = aFecha(ordenBase.order_estimated_delivery_date);

  const deliveryDays = diferenciaEnDias(purchase, delivered);
  const estimatedDays = diferenciaEnDias(purchase, estimated);

  let onTime = null;
  if (delivered && estimated) {
    onTime = delivered.getTime() <= estimated.getTime();
  }

  return {
    delivery_days: deliveryDays,
    estimated_days: estimatedDays,
    on_time: onTime
  };
}

// Documento para la colección order_analytics (pedido consolidado).
function construirDocumentoOrderAnalytics(ordenBase, items, pagos, review) {
  const totals = calcularTotales(items, pagos);
  const logistics = calcularLogistica(ordenBase);

  return {
    order_id: limpiarTexto(ordenBase.order_id),
    status: limpiarTexto(ordenBase.order_status),
    purchase_timestamp: aFecha(ordenBase.order_purchase_timestamp),
    approved_at: aFecha(ordenBase.order_approved_at),
    delivered_carrier_date: aFecha(ordenBase.order_delivered_carrier_date),
    delivered_customer_date: aFecha(ordenBase.order_delivered_customer_date),
    estimated_delivery_date: aFecha(ordenBase.order_estimated_delivery_date),
    customer: {
      customer_id: limpiarTexto(ordenBase.customer_id),
      customer_unique_id: limpiarTexto(ordenBase.customer_unique_id),
      state: limpiarTexto(ordenBase.customer_state),
      city: limpiarTexto(ordenBase.customer_city),
      zip_code_prefix: aEntero(ordenBase.customer_zip_code_prefix)
    },
    items,
    payments: pagos,
    review,
    totals,
    logistics,
    has_overflow: items.length > MAX_ITEMS_EMBEBIDOS,
    _sync: {
      source: 'postgresql_etl',
      synced_at: new Date()
    }
  };
}

// Documento para la colección reviews_analytics (reseña enriquecida).
function construirDocumentoReviewsAnalytics(ordenBase, items, filaReview) {
  if (!filaReview) {
    return null;
  }

  const score = aEntero(filaReview.review_score);
  const title = limpiarTexto(filaReview.title);
  const message = limpiarTexto(filaReview.message);

  const creation = aFecha(filaReview.creation_date);
  const answer = aFecha(filaReview.answer_date);

  let responseTimeHours = null;
  if (creation && answer) {
    responseTimeHours = Math.round(((answer.getTime() - creation.getTime()) / 3600000) * 10) / 10;
  }

  const productIds = [...new Set(items.map((it) => it.product_id).filter(Boolean))];
  const productCategories = [...new Set(items.map((it) => it.product_category).filter(Boolean))];
  const sellerIds = [...new Set(items.map((it) => it.seller_id).filter(Boolean))];

  return {
    review_id: limpiarTexto(filaReview.review_id),
    order_id: limpiarTexto(ordenBase.order_id),
    review_score: score,
    text: {
      title,
      message
    },
    tags: construirTagsReview(score, message, true),
    response_time_hours: responseTimeHours,
    creation_date: creation,
    answer_date: answer,
    product_ids: productIds,
    product_categories: productCategories,
    seller_ids: sellerIds,
    customer: {
      customer_unique_id: limpiarTexto(ordenBase.customer_unique_id),
      state: limpiarTexto(ordenBase.customer_state)
    }
  };
}

// ---------------------------------------------------------------------------
// Reconciliación
// ---------------------------------------------------------------------------

async function reconciliarConteos(pool, ordersCollection) {
  const totalPG = await pool.query('SELECT COUNT(*)::int AS total FROM ecommerce.orders');
  const totalMongo = await ordersCollection.countDocuments({});

  const totalPostgres = totalPG.rows[0].total;
  const diferencia = totalPostgres - totalMongo;

  logger.info('Resultado de reconciliación de conteos', {
    totalPostgresOrders: totalPostgres,
    totalMongoOrderAnalytics: totalMongo,
    diferencia
  });

  return { totalPostgres, totalMongo, diferencia };
}

// ---------------------------------------------------------------------------
// LOAD + Orquestación
// ---------------------------------------------------------------------------

async function runETL() {
  const inicio = Date.now();
  logger.info('Iniciando ejecución ETL');

  let pool;
  let mongoDb;

  try {
    const watermark = await leerWatermark();
    logger.info('Watermark actual leído', { watermark });

    pool = obtenerPostgresPool();
    mongoDb = await obtenerMongoDB();

    const ordersCollection = mongoDb.collection('order_analytics');
    const reviewsCollection = mongoDb.collection('reviews_analytics');

    const ordenes = await obtenerOrdenesNuevas(pool, watermark);
    logger.info('Órdenes encontradas para sincronizar', { total: ordenes.length });

    if (ordenes.length === 0) {
      await reconciliarConteos(pool, ordersCollection);
      logger.info('No hay nuevas órdenes para sincronizar');
      return {
        procesadas: 0,
        ordersUpserts: 0,
        reviewsUpserts: 0,
        watermarkAnterior: watermark,
        watermarkNuevo: watermark
      };
    }

    let ordersUpserts = 0;
    let reviewsUpserts = 0;
    let maxTimestamp = watermark;

    for (const orden of ordenes) {
      const orderId = limpiarTexto(orden.order_id);

      const [filasItems, filasPagos, filaReview] = await Promise.all([
        obtenerItemsPorOrden(pool, orden.order_id),
        obtenerPagosPorOrden(pool, orden.order_id),
        obtenerReviewPorOrden(pool, orden.order_id)
      ]);

      const items = transformarItems(filasItems);
      const pagos = transformarPagos(filasPagos);
      const reviewEmbebida = transformarReviewEmbebida(filaReview);

      // 1) Upsert en order_analytics (documento central).
      const docOrden = construirDocumentoOrderAnalytics(orden, items, pagos, reviewEmbebida);
      const resOrden = await ordersCollection.updateOne(
        { order_id: orderId },
        { $set: docOrden },
        { upsert: true }
      );
      if (resOrden.upsertedCount > 0 || resOrden.matchedCount > 0) {
        ordersUpserts += 1;
      }

      // 2) Upsert en reviews_analytics (solo si el pedido tiene reseña).
      const docReview = construirDocumentoReviewsAnalytics(orden, items, filaReview);
      if (docReview && docReview.review_id) {
        const resReview = await reviewsCollection.updateOne(
          { review_id: docReview.review_id },
          { $set: docReview },
          { upsert: true }
        );
        if (resReview.upsertedCount > 0 || resReview.matchedCount > 0) {
          reviewsUpserts += 1;
        }
      }

      const timestampOrden = aFecha(orden.order_purchase_timestamp);
      if (timestampOrden) {
        const iso = timestampOrden.toISOString();
        if (iso > maxTimestamp) {
          maxTimestamp = iso;
        }
      }
    }

    await escribirWatermark(maxTimestamp);
    logger.info('Watermark actualizado correctamente', { maxTimestamp });

    await reconciliarConteos(pool, ordersCollection);

    const duracionMs = Date.now() - inicio;
    logger.info('ETL completado con éxito', {
      procesadas: ordenes.length,
      ordersUpserts,
      reviewsUpserts,
      duracionMs
    });

    return {
      procesadas: ordenes.length,
      ordersUpserts,
      reviewsUpserts,
      watermarkAnterior: watermark,
      watermarkNuevo: maxTimestamp,
      duracionMs
    };
  } catch (error) {
    logger.error('Fallo durante la ejecución ETL', {
      mensaje: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await Promise.allSettled([cerrarPostgres(), cerrarMongoDB()]);
    logger.info('Recursos de conexión liberados');
  }
}

module.exports = {
  runETL,
  // Exportados para pruebas unitarias / reutilización.
  construirDocumentoOrderAnalytics,
  construirDocumentoReviewsAnalytics,
  transformarItems,
  transformarPagos,
  transformarReviewEmbebida,
  calcularTotales,
  calcularLogistica,
  diferenciaEnDias
};

if (require.main === module) {
  runETL()
    .then((resumen) => {
      logger.info('Ejecución manual finalizada', resumen);
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

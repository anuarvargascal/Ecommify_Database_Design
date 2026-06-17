// ====
// ANÁLISIS DE RENDIMIENTO CON .explain()
// ====

use("ecommify_analytics_v1");

print("\n📊 ANÁLISIS DE RENDIMIENTO: .explain('executionStats')");
print("============================================================");

// Función robusta para encontrar executionStats en distintos formatos de explain
function findExecutionStats(obj) {
  if (!obj || typeof obj !== "object") return null;

  if (
    obj.executionStats &&
    typeof obj.executionStats === "object" &&
    (
      obj.executionStats.totalDocsExamined !== undefined ||
      obj.executionStats.totalKeysExamined !== undefined ||
      obj.executionStats.executionTimeMillis !== undefined ||
      obj.executionStats.nReturned !== undefined
    )
  ) {
    return obj.executionStats;
  }

  if (Array.isArray(obj.stages)) {
    for (var i = 0; i < obj.stages.length; i++) {
      var foundInStages = findExecutionStats(obj.stages[i]);
      if (foundInStages) return foundInStages;
    }
  }

  if (obj.shards && typeof obj.shards === "object") {
    for (var shardName in obj.shards) {
      var foundInShards = findExecutionStats(obj.shards[shardName]);
      if (foundInShards) return foundInShards;
    }
  }

  for (var key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] &&
      typeof obj[key] === "object"
    ) {
      var found = findExecutionStats(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

function printStats(label, stats) {
  print(label);
  if (!stats) {
    print("No se pudieron extraer estadísticas de ejecución.");
    return;
  }

  print("executionTimeMillis: " + (stats.executionTimeMillis !== undefined ? stats.executionTimeMillis : "N/A"));
  print("totalDocsExamined: " + (stats.totalDocsExamined !== undefined ? stats.totalDocsExamined : "N/A"));
  print("totalKeysExamined: " + (stats.totalKeysExamined !== undefined ? stats.totalKeysExamined : "N/A"));
  print("nReturned: " + (stats.nReturned !== undefined ? stats.nReturned : "N/A"));
}

// ----
// 1 Pipeline Productos pesados
// ----

print("\n--- D.1 Pipeline Productos Pesados (CON índice parcial) ---");
var explainHeavy = db.product_catalog.explain("executionStats").aggregate([
  { $match: { "physical_attributes.weight_g": { $gt: 5000 } } },
  { $sort: { "physical_attributes.weight_g": -1 } },
  { $limit: 100 }
]);

var statsHeavy = findExecutionStats(explainHeavy);
printStats("", statsHeavy);

// ----
// 2 Pipeline Reseñas negativas
// ----

print("\n--- D.2 Pipeline Reseñas Negativas (CON índice parcial) ---");
var explainNeg = db.order_analytics.explain("executionStats").aggregate([
  {
    $match: {
      "review.score": { $lte: 2 },
      "review.message": { $exists: true }
    }
  },
  { $sort: { "review.score": 1, purchase_timestamp: -1 } }
]);

var statsNeg = findExecutionStats(explainNeg);
printStats("", statsNeg);

// ----
// 3 Pipeline Ranking ventas por estado
// ----

print("\n--- D.3 Pipeline Ranking Ventas por Estado ---");
var explainRanking = db.order_analytics.explain("executionStats").aggregate([
  { $match: { status: { $in: ["delivered", "shipped"] } } },
  { $unwind: "$items" },
  {
    $group: {
      _id: { state: "$customer.state", city: "$customer.city" },
      gross_product_revenue: { $sum: "$items.price" }
    }
  },
  { $sort: { gross_product_revenue: -1 } },
  { $limit: 100 }
]);

var statsRanking = findExecutionStats(explainRanking);
printStats("", statsRanking);

// ----
// 4 Consulta simple con hint para comparar índices
// ----

print("\n--- D.4 Comparación: find con y sin hint ---");

var filterReviews = {
  review_score: { $lte: 3 },
  creation_date: {
    $gte: new Date("2018-03-01"),
    $lt: new Date("2018-06-01")
  }
};

// Sin hint
var explainNatural = db.reviews_analytics
  .find(filterReviews)
  .explain("executionStats");

var statsNatural = findExecutionStats(explainNatural);
print("Sin hint:");
print("totalDocsExamined: " + (statsNatural && statsNatural.totalDocsExamined !== undefined ? statsNatural.totalDocsExamined : "N/A"));
print("totalKeysExamined: " + (statsNatural && statsNatural.totalKeysExamined !== undefined ? statsNatural.totalKeysExamined : "N/A"));
print("executionTimeMillis: " + (statsNatural && statsNatural.executionTimeMillis !== undefined ? statsNatural.executionTimeMillis : "N/A"));

// Con hint
var explainHint = db.reviews_analytics
  .find(filterReviews)
  .hint("idx_score_date")
  .explain("executionStats");

var statsHint = findExecutionStats(explainHint);
print("\nCon hint idx_score_date:");
print("totalDocsExamined: " + (statsHint && statsHint.totalDocsExamined !== undefined ? statsHint.totalDocsExamined : "N/A"));
print("totalKeysExamined: " + (statsHint && statsHint.totalKeysExamined !== undefined ? statsHint.totalKeysExamined : "N/A"));
print("executionTimeMillis: " + (statsHint && statsHint.executionTimeMillis !== undefined ? statsHint.executionTimeMillis : "N/A"));

print("\n✅ Análisis de rendimiento completado");
print("============================================================");
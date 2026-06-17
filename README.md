# Ecommify - Database Design & Optimization

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Project Status](https://img.shields.io/badge/Status-Completed-success)](https://github.com)

> **Diseño conceptual, lógico y físico de base de datos para plataforma de e-commerce**  
> *Arquitectura híbrida transaccional-analítica con PostgreSQL y MongoDB*


## Sobre el Proyecto

### Contexto Académico

Este proyecto representa el **diseño integral de una base de datos para un sistema de comercio electrónico** denominado **Ecommify**, desarrollado como parte de la **Actividad 5** del curso **Diseño y Optimización de Bases de Datos** en la Universidad de la Sabana.

El proyecto se basa en el [**dataset Olist**](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce), un conjunto de datos real de comercio electrónico brasileño con aproximadamente **100,000 pedidos** registrados entre 2016 y 2018, disponible en Kaggle. Este dataset proporciona información detallada sobre clientes, vendedores, productos, pagos, reseñas y geolocalización.


# 📦 Ecommify — Módulo MongoDB (Analítico)

##  Arquitectura

```
┌─────────────────────┐        ETL batch        ┌─────────────────────┐
│   PostgreSQL         │ ──────────────────────► │   MongoDB Atlas     │
│   (Supabase)         │    incremental          │   (Free Tier M0)    │
│                      │                         │                      │
│  • 8 tablas 3FN      │                         │  • 5 colecciones     │
│  • ACID, FK, CHECK   │                         │  • Documentos JSON   │
│  • PostGIS, JSONB    │                         │  • Aggregation       │
│  • Transaccional     │                         │  • Analítico         │
└─────────────────────┘                          └─────────────────────┘
```

## Estructura de Archivos

```
mongodb/
├── scripts/
│   ├── 01_create_collections.js       ← Creación de BD, colecciones y JSON Schema
│   ├── 02_insert_data.js              ← Datos de ejemplo 
│   ├── 03_create_indexes.js           ← 20 índices con justificación
│   ├── 04_aggregation_pipelines.js    ← 5 pipelines + 3 consultas complejas
│   └── 05_explain_analysis.js         ← Evidencias de rendimiento
└── evidencias
    └── screenshots
```

## Setup Rápido

### Prerrequisitos

1. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free Tier M0)
2. [mongosh](https://www.mongodb.com/docs/mongodb-shell/) instalado localmente

### Pasos

```bash
# 1. Conectar a MongoDB Atlas
mongosh "mongodb+srv://<tu-cluster>.mongodb.net/" --username <usuario>

# 2. Crear colecciones con validación
load("scripts/01_create_collections.js")

# 3. Insertar datos de ejemplo
load("scripts/02_insert_data.js")

# 4. Crear índices
load("scripts/03_create_indexes.js")

# 5. Ejecutar pipelines
load("scripts/04_aggregation_pipelines.js")

# 6. Verificar rendimiento
load("scripts/05_explain_analysis.js")
```

##  Colecciones

| Colección | Documentos | Patrones | Propósito |
|-----------|-----------|----------|-----------|
| `product_catalog` | 15 | Attribute, Computed, Subset, Extended Reference | Catálogo enriquecido |
| `order_analytics` | 12 | Embedded, Extended Reference, Computed, Outlier | Pedido consolidado |
| `reviews_analytics` | 10 | Reference, Extended Reference, Attribute | Reseñas enriquecidas |
| `user_behavior` | 6 | Bucket, Computed | Comportamiento de usuario |
| `geo_sales_summary` | 10 | Computed, Bucket, Subset | Agregados geográficos |

## Índices (20 total)

- 5 únicos (equivalentes a PK)
- 10 compuestos (cubren patrones de consulta frecuentes)
- 3 parciales (solo indexan subconjuntos relevantes)
- 1 de texto (búsqueda textual en categorías)
- 1 descendente (ranking por revenue)

## Aggregation Pipelines

| # | Equivalente PostgreSQL | Complejidad en PG | Ventaja MongoDB |
|---|----------------------|-------------------|-----------------|
| 1 | Q14: Ranking ventas por estado | 4 tablas, 3 JOINs | 0 JOINs, datos embebidos |
| 2 | Q5: Reseñas negativas | 5 tablas, filtro JSONB | Acceso directo a review embebida |
| 3 | Q10: Reseñas temporal | 7 tablas, TSTZRANGE | 0 JOINs, filtro por fecha |
| 4 | Q12: Productos pesados | Cast JSONB a numeric | Campo numérico nativo |
| 5 | Q7: Pagos por tipo | Single-table | $unwind + $group |

## Referencias

- [MongoDB Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [Aggregation Pipeline](https://www.mongodb.com/docs/manual/aggregation/)
- [Building with Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

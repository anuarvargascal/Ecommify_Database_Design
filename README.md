# Ecommify - Database Design & Optimization

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Project Status](https://img.shields.io/badge/Status-Completed-success)](https://github.com)

> **Diseño conceptual, lógico y físico de base de datos para plataforma de e-commerce**  
> *Arquitectura híbrida transaccional-analítica con PostgreSQL y MongoDB*

---

### 📋 Tabla de Contenido
- [Ecommify - Database Design \& Optimization](#ecommify---database-design--optimization)
    - [📋 Tabla de Contenido](#-tabla-de-contenido)
  - [Sobre el Proyecto](#sobre-el-proyecto)
    - [Contexto Académico](#contexto-académico)
  - [Ecommify — Módulo PostgreSQL (Transaccional)](#ecommify--módulo-postgresql-transaccional)
    - [Estructura de Archivos](#estructura-de-archivos)
    - [Datos fuente](#datos-fuente)
      - [Observaciones de carga](#observaciones-de-carga)
    - [Modelo de datos](#modelo-de-datos)
      - [Tablas principales](#tablas-principales)
      - [Relaciones principales](#relaciones-principales)
      - [Tipos avanzados usados](#tipos-avanzados-usados)
      - [Índices relevantes](#índices-relevantes)
    - [Optimización de consultas](#optimización-de-consultas)
      - [Métricas destacadas del informe](#métricas-destacadas-del-informe)
    - [Estrategia de particionamiento de `orders`](#estrategia-de-particionamiento-de-orders)
  - [Ecommify — Módulo MongoDB (Analítico)](#ecommify--módulo-mongodb-analítico)
    - [Arquitectura](#arquitectura)
    - [Estructura de Archivos](#estructura-de-archivos-1)
    - [Setup Rápido](#setup-rápido)
      - [Prerrequisitos](#prerrequisitos)
      - [Pasos de ejecución](#pasos-de-ejecución)
    - [Colecciones](#colecciones)
    - [Índices (20 total)](#índices-20-total)
    - [Aggregation Pipelines](#aggregation-pipelines)
  - [ETL PostgreSQL → MongoDB (etl-postgres-mongodb)](#etl-postgresql--mongodb-etl-postgres-mongodb)
    - [¿Qué hace este proyecto?](#qué-hace-este-proyecto)
    - [Estructura](#estructura)
    - [Requisitos previos](#requisitos-previos)
    - [Instalación paso a paso](#instalación-paso-a-paso)
    - [Configuración de variables de entorno](#configuración-de-variables-de-entorno)
    - [Comandos disponibles](#comandos-disponibles)
    - [Funcionamiento interno](#funcionamiento-interno)
      - [Watermark](#watermark)
      - [Upsert en MongoDB](#upsert-en-mongodb)
      - [Reconciliación](#reconciliación)
    - [Troubleshooting Básico](#troubleshooting-básico)
  - [Referencias](#referencias)

---

## Sobre el Proyecto

### Contexto Académico
Este proyecto representa el **diseño integral de una base de datos para un sistema de comercio electrónico** denominado **Ecommify**, desarrollado como parte de la **Actividad 5** del curso **Diseño y Optimización de Bases de Datos** en la Universidad de la Sabana.

El proyecto se basa en el [**dataset Olist**](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce), un conjunto de datos real de comercio electrónico brasileño con aproximadamente **100,000 pedidos** registrados entre 2016 y 2018, disponible en Kaggle. Este dataset proporciona información detallada sobre clientes, vendedores, productos, pagos, reseñas y geolocalización.

---

## Ecommify — Módulo PostgreSQL (Transaccional)

Implementación técnica de una base de datos PostgreSQL para un escenario de comercio electrónico. Incluye scripts de creación del modelo, carga de datos CSV, uso de extensiones de PostgreSQL, tipos avanzados como JSONB y TSTZRANGE, análisis geográfico con PostGIS, optimización de consultas mediante índices especializados y evaluación de rendimiento con EXPLAIN ANALYZE. El proyecto también incorpora una estrategia de particionamiento mensual para la tabla orders y documentación comparativa antes/después de las optimizaciones.

### Estructura de Archivos

```text
postgresql/
├── queries/
│   ├── 01_consultas.sql               ← Consultas iniciales y optimizadas
│   ├── 02_particionamiento.sql        ← Estrategia particionamiento Ordenes 
├── schema/
│   ├── 01_script_ecommerce.sql        ← tablas, indices, restricciones, extensiones
│   ├── 02_diagrama_mer.drawio         ← Diagrama modelo entidad relacion en draw.io
├── explain postgresql/                ← Planes de ejecución de consultas iniciales y optimizadas 
└── explain particionamiento           ← Planes de ejecución del particionamiento de Ordenes
└── evidencias
│   └── screenshots
└── datos fuentes    
```

### Datos fuente

Esta carpeta contiene los archivos CSV usados para poblar el esquema `ecommerce`.

| Archivo | Descripción | Filas |
| :--- | :--- | ---: |
| `customers.csv` | Clientes y prefijo postal. | 99.441 |
| `sellers.csv` | Vendedores y prefijo postal. | 3.095 |
| `dim_geolocation_zip.csv` | Dimensión geográfica por prefijo postal y coordenadas promedio. | 15.078 |
| `product_categories.csv` | Catálogo de categorías y equivalencia en inglés. | 71 |
| `products.csv` | Productos y especificaciones en JSON. | 32.951 |
| `orders.csv` | Órdenes de compra y fechas del ciclo de pedido. | 99.441 |
| `order_items.csv` | Ítems de las órdenes, producto, vendedor, precio y flete. | 112.650 |
| `order_payments.csv` | Pagos, tipo de pago, cuotas y valor. | 103.886 |
| `order_reviews.csv` | Reseñas, calificación, contenido y periodo de respuesta. | 99.224 |

#### Observaciones de carga
- `products.csv` usa delimitador `;` porque contiene JSON en una columna.
- `dim_geolocation_zip.csv` usa delimitador `;` e incluye columnas auxiliares `latitude_avg` y `longitude_avg`.
- Los demás archivos usan delimitador `,`.

### Modelo de datos

El modelo representa un dominio de comercio electrónico con entidades transaccionales, entidades maestras y datos geográficos. El esquema usa el namespace `ecommerce`.

#### Tablas principales
| Tabla | Tipo | Descripción funcional | Filas en CSV |
| :--- | :--- | :--- | ---: |
| `customers` | Maestra | Clientes y código postal asociado. | 99.441 |
| `sellers` | Maestra | Vendedores y código postal asociado. | 3.095 |
| `dim_geolocation_zip` | Dimensión | Código postal, ciudad, estado y localización geográfica. | 15.078 |
| `product_categories` | Catálogo | Categorías de producto y traducción al inglés. | 71 |
| `products` | Maestra | Productos, categoría y especificaciones con `JSONB`. | 32.951 |
| `orders` | Transaccional | Órdenes de compra, cliente, estado y fechas. | 99.441 |
| `order_items` | Detalle | Ítems por orden, producto, vendedor, precio y flete. | 112.650 |
| `order_payments` | Detalle | Pagos por orden, tipo de pago, cuotas y valor. | 103.886 |
| `order_reviews` | Transaccional | Reseñas por orden, contenido `JSONB` y periodo `TSTZRANGE`. | 99.224 |

#### Relaciones principales
- `orders.customer_id` referencia `customers.customer_id`.
- `order_items.order_id` referencia `orders.order_id`.
- `order_items.product_id` referencia `products.product_id`.
- `order_items.seller_id` referencia `sellers.seller_id`.
- `order_payments.order_id` referencia `orders.order_id`.
- `order_reviews.order_id` referencia `orders.order_id`.
- `products.product_category_name` referencia `product_categories.product_category_name`.
- `customers.customer_zip_code_prefix` y `sellers.seller_zip_code_prefix` referencian `dim_geolocation_zip.zip_code_prefix`.

#### Tipos avanzados usados
- `JSONB`: especificaciones de producto y contenido de reseñas.
- `TSTZRANGE`: intervalo entre creación y respuesta de reseña.
- `citext`: manejo de ciudad sin sensibilidad a mayúsculas/minúsculas.
- `geometry(Point,4326)` y `geography(Point,4326)`: localización espacial para análisis geográfico.

#### Índices relevantes
- B-tree sobre llaves de join y agrupación.
- GIN sobre columnas `JSONB`.
- GiST sobre columnas geográficas y rangos temporales.
- Índices parciales para filtros recurrentes.
- Índice funcional descendente sobre peso extraído de `JSONB`.
- Índice covering sobre pagos para favorecer `Index Only Scan`.

### Optimización de consultas

El proyecto documenta el análisis de consultas mediante `EXPLAIN ANALYZE` y `EXPLAIN (ANALYZE, BUFFERS)`.

| Consulta | Problema identificado | Optimización aplicada | Resultado esperado |
|---:|:---|:---|:---|
| 14 | Agregación directa con `COUNT(DISTINCT)`. | Preagregación por `order_id` e índice `order_items(order_id)`. | Menor tiempo y eliminación de disco temporal. |
| 5 | Filtrado de reseñas negativas en `JSONB`. | Índice parcial sobre reseñas con mensaje y baja calificación. | Reducción de lectura física. |
| 10 | Filtro temporal/score con duplicidad. | Índice parcial GiST sobre `review_response_period`. | Mejora en consulta por ventana temporal. |
| 12 | Escaneo completo y cast sobre `JSONB`. | Índice funcional parcial B-tree descendente sobre `product_weight_g`. | Uso de `Index Scan`, respuesta rápida para Top-N. |
| 7 | `COUNT(DISTINCT)` costoso. | Preagrupación por orden e índice covering con `INCLUDE`. | `Index Only Scan` y eliminación de temporales. |
| 15 | Búsqueda geográfica lenta. | Uso de GiST geográfico y B-tree por prefijo postal. | Mejor búsqueda de vendedores cercanos. |

#### Métricas destacadas del informe
| Consulta | Mejora reportada |
| :--- | ---: |
| 12 | Reducción aproximada de 98,12 % en tiempo de ejecución. |
| 7 | Reducción aproximada de 84,97 % en tiempo de ejecución. |
| 14 | Reducción aproximada de 69,11 % en tiempo de ejecución. |
| 5 | Reducción aproximada de 50,06 % en tiempo de ejecución. |
| 10 | Reducción aproximada de 26,34 % en tiempo de ejecución. |

> **Criterio de interpretación:** El campo `cost` no son milisegundos; basarse en `actual time`, buffers y uso de disco temporal.

### Estrategia de particionamiento de `orders`

- **Tabla seleccionada:** `orders`, por ser central y filtrar por fecha/estado.
- **Clave de particionamiento:** `order_purchase_timestamp`.
- **Tipo de particionamiento:** Por rango mensual (`RANGE`). Particiones históricas: Sep 2016 - Oct 2018 + `DEFAULT`.
- **Consideración sobre llave primaria:** Debe incluir la columna de particionamiento. Llave primaria compuesta: `(order_id, order_purchase_timestamp)`.
- **Beneficio esperado:** `partition pruning` para reportes por mes, cohortes y métricas logísticas.
- **Limitación:** Consultas globales sin filtro temporal pueden incrementar costo de planificación.

---

## Ecommify — Módulo MongoDB (Analítico)

### Arquitectura

```text
┌──────────────┐        ETL batch        ┌──────────────────┐
│  PostgreSQL  │ ──────────────────────► │  MongoDB Atlas   │
│  (Supabase)  │       incremental       │  (Free Tier M0)  │
├──────────────┤                         ├──────────────────┤
│ • 8 tablas   │                         │ • 5 colecciones  │
│ • ACID, FK   │                         │ • Documentos JSON│
│ • Transac.   │                         │ • Analítico      │
└──────────────┘                         └──────────────────┘
```

### Estructura de Archivos

```text
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

### Setup Rápido

#### Prerrequisitos
1. Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. [mongosh](https://www.mongodb.com/docs/mongodb-shell/) instalado.

#### Pasos de ejecución
```bash
# 1. Conectar a MongoDB Atlas
mongosh "mongodb+srv://<tu-cluster>.mongodb.net/" --username <usuario>

# 2. Ejecutar scripts en orden
load("scripts/01_create_collections.js")
load("scripts/02_insert_data.js")
load("scripts/03_create_indexes.js")
load("scripts/04_aggregation_pipelines.js")
load("scripts/05_explain_analysis.js")
```

### Colecciones

| Colección | Documentos | Patrones Aplicados | Propósito |
| :--- | :--- | :--- | :--- |
| `product_catalog` | 15 | Attribute, Computed, Subset, Extended Ref | Catálogo enriquecido |
| `order_analytics` | 12 | Embedded, Extended Ref, Computed, Outlier | Pedido consolidado |
| `reviews_analytics` | 10 | Reference, Extended Reference, Attribute | Reseñas enriquecidas |
| `user_behavior` | 6 | Bucket, Computed | Comportamiento de usuario |
| `geo_sales_summary` | 10 | Computed, Bucket, Subset | Agregados geográficos |

### Índices (20 total)
- 5 únicos (equivalentes a PK).
- 10 compuestos (cubren patrones frecuentes).
- 3 parciales (indexan subconjuntos relevantes).
- 1 de texto (búsqueda en categorías).
- 1 descendente (ranking por revenue).

### Aggregation Pipelines

| # | Equivalente PostgreSQL | Complejidad en PG | Ventaja MongoDB |
|---|----|----|----|
| 1 | Q14: Ranking ventas por estado | 4 tablas, 3 JOINs | 0 JOINs, datos embebidos |
| 2 | Q5: Reseñas negativas | 5 tablas, filtro JSONB | Acceso directo a review |
| 3 | Q10: Reseñas temporal | 7 tablas, TSTZRANGE | 0 JOINs, filtro fecha |
| 4 | Q12: Productos pesados | Cast JSONB a numeric | Campo numérico nativo |
| 5 | Q7: Pagos por tipo | Single-table | $unwind + $group |

---

## ETL PostgreSQL → MongoDB (etl-postgres-mongodb)

Proyecto ETL incremental en Node.js para sincronizar pedidos desde PostgreSQL (Supabase) hacia MongoDB (Atlas), consolidando información relacional en documentos listos para analítica.

### ¿Qué hace este proyecto?
1. **EXTRACT**: consulta órdenes nuevas usando **watermark** (`order_purchase_timestamp > lastSync`).
2. **TRANSFORM**: consolida datos de 8 tablas (órdenes, clientes, geo, ítems, productos, categorías, vendedores, pagos y reseñas) incluyendo métricas pre-calculadas como `totals` y `logistics`.
3. **LOAD**: hace **upsert** en colecciones `order_analytics` y `reviews_analytics`.
4. **WATERMARK**: actualiza `watermark.json` al terminar.
5. **RECONCILIACIÓN**: compara conteo de órdenes de PG vs documentos en MongoDB.

### Estructura
```text
etl-postgres-mongodb/
├── src/
│   ├── db/          ← Conexiones postgres y mongodb
│   ├── etl.js       ← Lógica de transformación
│   └── index.js     ← Punto de entrada
├── watermark.json   ← Control incremental
└── .env             ← Variables de entorno
```

### Requisitos previos
- Node.js 18+, npm 9+.
- Acceso a PostgreSQL (Supabase) y MongoDB (Atlas).

### Instalación paso a paso
```bash
cd etl-postgres-mongodb
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

### Configuración de variables de entorno
```env
POSTGRESQL_URL=postgresql://usuario:password@host:5432/base_de_datos
POSTGRESQL_SCHEMA=ecommerce
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/ecommify_analytics
MONGODB_DB_NAME=ecommify_analytics_v1
```

### Comandos disponibles
- `npm start`: Modo scheduler (corre cada 5 minutos).
- `npm run sync`: Ejecución manual de una sola corrida.

### Funcionamiento interno

#### Watermark
Se guarda en `watermark.json`. Si no existe, usa `2000-01-01T00:00:00.000Z` por defecto.

#### Upsert en MongoDB
- `order_analytics`: Incluye subdocumentos `customer`, arrays `items`, `payments`, campo `review` embebido, y objetos `totals` (Computed Pattern) y `logistics`.
- `reviews_analytics`: Guarda reseñas con tags y métricas de tiempo de respuesta.

#### Reconciliación
Registra la diferencia entre `COUNT(*)` de PG y `countDocuments` de MongoDB para detectar desajustes.

### Troubleshooting Básico
1. **Error variable de entorno:** Revisa el archivo `.env`.
2. **Timeout PG:** Revisa host, puerto y permisos en Supabase.
3. **IP Allowlist Atlas:** Valida permisos de acceso en red de MongoDB Atlas.
4. **No sincroniza:** Revisa `watermark.json` o intenta ejecutar manualmente con `npm run sync`.

---

## Referencias
- [MongoDB Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [Aggregation Pipeline](https://www.mongodb.com/docs/manual/aggregation/)
- [Building with Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

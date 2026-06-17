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



# ETL PostgreSQL → MongoDB (etl-postgres-mongodb)

Proyecto ETL incremental en Node.js para sincronizar pedidos desde PostgreSQL (Supabase) hacia MongoDB (Atlas), consolidando información relacional en documentos listos para analítica.

## ¿Qué hace este proyecto?

Este ETL realiza el flujo completo:

1. **EXTRACT**: consulta órdenes nuevas desde PostgreSQL usando un **watermark** (`order_purchase_timestamp > lastSync`).
2. **TRANSFORM**: para cada orden, consolida:
   - Datos de `orders`
   - Datos de `customers`
   - Geolocalización (`city`, `state`) desde `dim_geolocation_zip` (por `zip_code_prefix`)
   - Ítems desde `order_items` + categoría en inglés (`products` → `product_categories`) + estado del vendedor (`sellers` → `dim_geolocation_zip`)
   - Pagos desde `order_payments`
   - Reseña desde `order_reviews` (contenido en JSONB `review_content`, periodo en TSTZRANGE `review_response_period`)
   - Métricas pre-calculadas: `totals` (Computed Pattern) y `logistics`
3. **LOAD**: hace **upsert** en MongoDB:
   - Colección `order_analytics` usando `order_id` como clave.
   - Colección `reviews_analytics` usando `review_id` (solo si el pedido tiene reseña).
4. Actualiza el watermark en `watermark.json` cuando la sincronización termina correctamente.
5. Ejecuta **reconciliación** comparando conteo de órdenes de PostgreSQL vs documentos en MongoDB.

También incluye scheduler con `node-cron` para correr automáticamente cada 5 minutos, propuesto solo para casos de prueba.

### Tablas de origen (PostgreSQL — esquema `ecommerce`)

| Tabla | Rol en el ETL |
|---|---|
| `orders` | Pedido (entidad principal, dispara el watermark) |
| `customers` | Cliente (`customer_unique_id`, `customer_zip_code_prefix`) |
| `dim_geolocation_zip` | Geolocalización por ZIP (`city`, `state`) para cliente y vendedor |
| `order_items` | Ítems del pedido (`price`, `freight_value`, `shipping_limit_date`) |
| `products` / `product_categories` | Categoría del producto (traducción a inglés) |
| `sellers` | Vendedor (para obtener su estado por ZIP) |
| `order_payments` | Pagos del pedido |
| `order_reviews` | Reseña (`review_content` JSONB, `review_response_period` TSTZRANGE) |

### Colecciones destino (MongoDB — base `ecommify_analytics`)

| Colección | Clave de upsert | Estado |
|---|---|---|
| `order_analytics` | `order_id` | ✅ Sincronizada por el ETL |
| `reviews_analytics` | `review_id` | ✅ Sincronizada por el ETL |
| `product_catalog` | `product_id` | ⏳ Agregado (job de agregación aparte) |
| `user_behavior` | `customer_unique_id` + `period` | ⏳ Agregado (job de agregación aparte) |
| `geo_sales_summary` | `state` + `period` | ⏳ Agregado (job de agregación aparte) |

## Estructura

```bash
etl-postgres-mongodb/
├── package.json
├── .env
├── .gitignore
├── src/
│   ├── index.js
│   ├── etl.js
│   ├── db/
│   │   ├── postgres.js
│   │   └── mongodb.js
│   └── utils/
│       ├── watermark.js
│       └── logger.js
└── watermark.json
```

## Requisitos previos

- Node.js 18+ (recomendado 18 o 20)
- npm 9+
- Acceso a PostgreSQL (Supabase)
- Acceso a MongoDB (Atlas)

## Instalación paso a paso

1. Clona o descarga el proyecto.
2. Entra en la carpeta del proyecto:

   ```bash
   cd etl-postgres-mongodb
   ```

3. Instala dependencias:

   ```bash
   npm install
   ```

4. Crea tu archivo `.env` a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

5. Edita `.env` con tus credenciales reales.

## Configuración de variables de entorno

Archivo `.env`:

```env
POSTGRESQL_URL=postgresql://usuario:password@host:5432/base_de_datos
POSTGRESQL_SCHEMA=ecommerce
MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/ecommify_analytics?retryWrites=true&w=majority
MONGODB_DB_NAME=ecommify_analytics_v1
```

### Notas

- `POSTGRESQL_URL`: cadena de conexión completa a PostgreSQL.
- `POSTGRESQL_SCHEMA`: esquema objetivo en PostgreSQL (por defecto `ecommerce`).
- `MONGODB_URL`: cadena de conexión de MongoDB Atlas (o instancia local).
- `MONGODB_DB_NAME`: opcional si ya viene la base en la URL; útil para fijar el nombre explícitamente.

## Configuración del esquema PostgreSQL (`ecommerce`)

Este proyecto está preparado para trabajar sobre el esquema `ecommerce` en PostgreSQL:

1. En la conexión se envía `search_path` para priorizar ese esquema.
2. Todas las consultas SQL del ETL usan formato explícito `esquema.tabla` (por ejemplo, `ecommerce.orders`).

Ejemplo recomendado en `.env`:

```env
POSTGRESQL_URL=postgresql://usuario:password@host:5432/base_de_datos
POSTGRESQL_SCHEMA=ecommerce
```

Si el esquema tiene otro nombre, cambia `POSTGRESQL_SCHEMA` y actualiza los prefijos de tabla en las queries SQL para mantener consistencia.

## Comandos disponibles

- **Modo scheduler (cada 5 minutos):**

  ```bash
  npm start
  ```

- **Ejecución manual de una sola corrida ETL:**

  ```bash
  npm run sync
  ```

## Funcionamiento interno

### Watermark

- Se guarda en `watermark.json` bajo la clave `lastSync`.
- Si el archivo no existe o es inválido, usa fecha por defecto:
  - `2000-01-01T00:00:00.000Z`

### Upsert en MongoDB

En la colección `order_analytics`, cada pedido se guarda con:

- Datos base del pedido (`order_id`, `status`, fechas)
- Subdocumento `customer` (incluye `city`, `state`, `zip_code_prefix`)
- Array `items` (con `product_category` en inglés y `seller_state`)
- Array `payments`
- Campo `review` embebido (objeto o `null`) con `tags` derivados
- `totals` (Computed Pattern): `items_count`, `total_product_value`, `total_freight`, `total_payment`
- `logistics`: `delivery_days`, `estimated_days`, `on_time`
- `has_overflow` (Outlier Pattern)
- Metadata `_sync`:
  - `source: "postgresql_etl"`
  - `synced_at: <Date>`

En la colección `reviews_analytics`, cada reseña se guarda con `text`, `tags` (incluye `score_N`), `response_time_hours`, y referencias `product_ids` / `product_categories` / `seller_ids`.

### Reconciliación

En cada corrida ETL se registra:

- `COUNT(*)` de `orders` en PostgreSQL
- `countDocuments({})` de `order_analytics` en MongoDB
- Diferencia entre ambos conteos

## Troubleshooting básico

### 1) Error: falta variable de entorno

Verifica que exista `.env` y que tenga:
- `POSTGRESQL_URL`
- `MONGODB_URL`

### 2) Error de conexión PostgreSQL (timeout/autenticación)

- Revisa host, usuario, password, puerto y nombre de base.
- Si usas Supabase, confirma permisos de red y credenciales activas.

### 3) Error de conexión MongoDB Atlas

- Revisa usuario/password y nombre de cluster en `MONGODB_URL`.
- Valida IP allowlist en Atlas (Network Access).

### 4) No aparecen nuevas órdenes en MongoDB

- Revisa `watermark.json` (puede estar avanzado).
- Ejecuta manualmente `npm run sync` y revisa logs.
- Si necesitas resincronizar desde cero, ajusta `lastSync` a una fecha más antigua.

### 5) Diferencias en reconciliación

La reconciliación puede mostrar diferencias por:
- Filtros incrementales por watermark
- Órdenes históricas aún no sincronizadas
- Cambios en tablas fuente después de la última corrida


## Referencias

- [MongoDB Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [Aggregation Pipeline](https://www.mongodb.com/docs/manual/aggregation/)
- [Building with Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)

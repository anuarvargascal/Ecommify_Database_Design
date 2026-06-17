const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

function obtenerPostgresPool() {
  if (!process.env.POSTGRESQL_URL) {
    throw new Error('Falta la variable de entorno POSTGRESQL_URL');
  }

  if (!pool) {
    const esquema = process.env.POSTGRESQL_SCHEMA || 'ecommerce';

    pool = new Pool({
      connectionString: process.env.POSTGRESQL_URL,
      options: `-c search_path=${esquema}`,
      ssl: process.env.POSTGRESQL_URL.includes('sslmode=disable')
        ? false
        : { rejectUnauthorized: false }
    });

    logger.info('Pool de PostgreSQL inicializado', { esquema });
  }

  return pool;
}

async function cerrarPostgres() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Conexión de PostgreSQL cerrada');
  }
}

module.exports = {
  obtenerPostgresPool,
  cerrarPostgres
};

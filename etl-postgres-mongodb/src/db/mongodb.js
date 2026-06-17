const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

let cliente;
let db;

async function obtenerMongoDB() {
  if (!process.env.MONGODB_URL) {
    throw new Error('Falta la variable de entorno MONGODB_URL');
  }

  if (!cliente) {
    cliente = new MongoClient(process.env.MONGODB_URL);
    await cliente.connect();

    if (process.env.MONGODB_DB_NAME) {
      db = cliente.db(process.env.MONGODB_DB_NAME);
    } else {
      // Si no se define el nombre, MongoDB usa el definido en la URL.
      db = cliente.db();
    }

    logger.info('Conexión a MongoDB inicializada');
  }

  return db;
}

async function cerrarMongoDB() {
  if (cliente) {
    await cliente.close();
    cliente = null;
    db = null;
    logger.info('Conexión de MongoDB cerrada');
  }
}

module.exports = {
  obtenerMongoDB,
  cerrarMongoDB
};

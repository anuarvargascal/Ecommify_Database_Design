require('dotenv').config();

const cron = require('node-cron');
const { runETL } = require('./etl');
const logger = require('./utils/logger');

let enEjecucion = false;

async function ejecutarETLSeguro(origen = 'scheduler') {
  if (enEjecucion) {
    logger.warn('Se omitió ejecución porque ya hay un ETL corriendo', { origen });
    return;
  }

  enEjecucion = true;

  try {
    logger.info('Disparando ejecución ETL', { origen });
    const resultado = await runETL();
    logger.info('Ejecución ETL finalizada', { origen, resultado });
  } catch (error) {
    logger.error('Error en ejecución ETL', {
      origen,
      mensaje: error.message
    });
  } finally {
    enEjecucion = false;
  }
}

function iniciarScheduler() {
  logger.info('Iniciando scheduler ETL cada 5 minutos');

  // Expresión cron: cada 5 minutos.
  cron.schedule('*/5 * * * *', () => {
    ejecutarETLSeguro('cron_5_minutos');
  });

  logger.info('Scheduler iniciado correctamente');
}

if (require.main === module) {
  iniciarScheduler();
  ejecutarETLSeguro('arranque_inicial');
}

module.exports = {
  iniciarScheduler,
  ejecutarETLSeguro
};

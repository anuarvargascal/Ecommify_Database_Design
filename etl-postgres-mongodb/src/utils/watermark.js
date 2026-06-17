const fs = require('fs/promises');
const path = require('path');

const WATERMARK_PATH = path.resolve(__dirname, '../../watermark.json');
const FECHA_POR_DEFECTO = '2000-01-01T00:00:00.000Z';

async function leerWatermark() {
  try {
    const contenido = await fs.readFile(WATERMARK_PATH, 'utf-8');
    const data = JSON.parse(contenido);
    if (data.lastSync) {
      return data.lastSync;
    }
    return FECHA_POR_DEFECTO;
  } catch (error) {
    // Si el archivo no existe o está corrupto, usamos fecha antigua.
    return FECHA_POR_DEFECTO;
  }
}

async function escribirWatermark(timestampISO) {
  const payload = {
    lastSync: timestampISO || FECHA_POR_DEFECTO
  };
  await fs.writeFile(WATERMARK_PATH, JSON.stringify(payload, null, 2));
}

module.exports = {
  leerWatermark,
  escribirWatermark,
  FECHA_POR_DEFECTO
};

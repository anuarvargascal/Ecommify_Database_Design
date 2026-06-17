function construirMensaje(nivel, mensaje, meta) {
  const timestamp = new Date().toISOString();
  if (meta !== undefined) {
    return `[${timestamp}] [${nivel}] ${mensaje} | ${JSON.stringify(meta)}`;
  }
  return `[${timestamp}] [${nivel}] ${mensaje}`;
}

function info(mensaje, meta) {
  console.log(construirMensaje('INFO', mensaje, meta));
}

function warn(mensaje, meta) {
  console.warn(construirMensaje('WARN', mensaje, meta));
}

function error(mensaje, meta) {
  console.error(construirMensaje('ERROR', mensaje, meta));
}

function debug(mensaje, meta) {
  console.debug(construirMensaje('DEBUG', mensaje, meta));
}

module.exports = {
  info,
  warn,
  error,
  debug
};

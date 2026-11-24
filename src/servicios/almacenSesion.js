export function crearAlmacenSesion(obtenerLocal, obtenerTemporal) {
  let recordar;
  const memoria = new Map();
  const preferencia = 'oscila-recordar-sesion';
  const leer = (obtener, clave) => {
    try { return obtener().getItem(clave); } catch { return null; }
  };
  const borrar = (obtener, clave) => {
    try { obtener().removeItem(clave); } catch { /* almacenamiento bloqueado */ }
  };
  return {
    elegirPersistencia(valor) {
      recordar = Boolean(valor);
      try { obtenerTemporal().setItem(preferencia, String(recordar)); } catch { /* solo memoria */ }
    },
    getItem(clave) {
      return memoria.get(clave) ?? leer(obtenerTemporal, clave) ?? leer(obtenerLocal, clave);
    },
    setItem(clave, valor) {
      const opcion = leer(obtenerTemporal, preferencia);
      const persistente = recordar ?? (opcion !== null ? opcion === 'true' :
        leer(obtenerTemporal, clave) === null && leer(obtenerLocal, clave) !== null);
      const destino = persistente ? obtenerLocal : obtenerTemporal;
      const otro = persistente ? obtenerTemporal : obtenerLocal;
      borrar(otro, clave);
      try {
        destino().setItem(clave, valor);
        memoria.delete(clave);
      } catch {
        memoria.set(clave, valor);
      }
    },
    removeItem(clave) {
      memoria.delete(clave);
      borrar(obtenerTemporal, clave);
      borrar(obtenerLocal, clave);
      borrar(obtenerTemporal, preferencia);
      recordar = undefined;
    },
  };
}

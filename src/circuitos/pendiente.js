// Circuito que otra página pide abrir en el montaje (por ejemplo, desde Aplicaciones).
let pendiente = null;

export function abrirEnMontaje(doc) {
  pendiente = doc;
}

/** Solo lee (el inicializador de useState puede ejecutarse dos veces en modo estricto). */
export function verPendiente() {
  return pendiente;
}

export function limpiarPendiente() {
  pendiente = null;
}

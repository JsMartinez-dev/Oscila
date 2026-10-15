// Caché de reconocimientos por hash de la imagen (IndexedDB) y contador local de solicitudes del día.
// El contador cuenta solo las solicitudes hechas desde este equipo: Google no expone la cuota restante.

const BD = 'circuitos-en-vivo';
const ALMACEN = 'reconocimientos';
export const EVENTO_SOLICITUDES = 'solicitudes-gemini';

export async function sha256(buffer) {
  const h = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function abrir() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB no disponible'));
    const req = indexedDB.open(BD, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(ALMACEN);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function leerCache(hash) {
  try {
    const db = await abrir();
    return await new Promise((resolve) => {
      const tx = db.transaction(ALMACEN, 'readonly');
      const r = tx.objectStore(ALMACEN).get(hash);
      r.onsuccess = () => resolve(r.result ?? null);
      r.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function guardarCache(hash, valor) {
  try {
    const db = await abrir();
    await new Promise((resolve) => {
      const tx = db.transaction(ALMACEN, 'readwrite');
      tx.objectStore(ALMACEN).put({ ...valor, fecha: new Date().toISOString() }, hash);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch {
    /* sin caché: no es grave */
  }
}

const claveHoy = () => {
  const d = new Date();
  return `gemini-solicitudes-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function solicitudesHoy() {
  try {
    return Number(localStorage.getItem(claveHoy()) ?? 0);
  } catch {
    return 0;
  }
}

export function sumarSolicitud() {
  try {
    localStorage.setItem(claveHoy(), String(solicitudesHoy() + 1));
  } catch {
    /* almacenamiento bloqueado */
  }
  window.dispatchEvent(new Event(EVENTO_SOLICITUDES));
}

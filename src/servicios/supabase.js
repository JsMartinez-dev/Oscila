import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const clavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

let recordarSesion;
const memoria = new Map();

export function elegirPersistenciaSesion(recordar) {
  recordarSesion = recordar;
}

// Supabase se encarga de guardar y renovar los tokens. Oscila elige dónde se guardan.
const almacenamiento = {
  getItem(clave) {
    if (memoria.has(clave)) return memoria.get(clave);
    try {
      return sessionStorage.getItem(clave) ?? localStorage.getItem(clave);
    } catch {
      return null;
    }
  },
  setItem(clave, valor) {
    try {
      // En una recarga, la renovación conserva la ubicación de la sesión anterior.
      const persistente = recordarSesion ?? (sessionStorage.getItem(clave) === null && localStorage.getItem(clave) !== null);
      const destino = persistente ? localStorage : sessionStorage;
      const otro = persistente ? sessionStorage : localStorage;
      destino.setItem(clave, valor);
      otro.removeItem(clave);
      memoria.delete(clave);
    } catch {
      memoria.set(clave, valor);
    }
  },
  removeItem(clave) {
    memoria.delete(clave);
    try {
      if (sessionStorage.getItem(clave) !== null) sessionStorage.removeItem(clave);
      else localStorage.removeItem(clave);
    } catch {
      // El navegador puede bloquear el almacenamiento.
    }
  },
};

export const supabase = url && clavePublica
  ? createClient(url, clavePublica, { auth: { storage: almacenamiento } })
  : null;

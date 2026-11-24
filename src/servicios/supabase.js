import { createClient } from '@supabase/supabase-js';
import { crearAlmacenSesion } from './almacenSesion.js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const clavePublica = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const almacenamiento = crearAlmacenSesion(() => localStorage, () => sessionStorage);
export const googleHabilitado = import.meta.env.VITE_AUTH_GOOGLE === 'true';

export function elegirPersistenciaSesion(recordar) {
  almacenamiento.elegirPersistencia(recordar);
}

// Supabase se encarga de guardar y renovar los tokens. Oscila elige dónde se guardan.
export const supabase = url && clavePublica
  ? createClient(url, clavePublica, { auth: { storage: almacenamiento } })
  : null;

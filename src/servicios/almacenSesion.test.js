import { describe, expect, it } from 'vitest';
import { crearAlmacenSesion } from './almacenSesion.js';

function almacen() {
  const datos = new Map();
  return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) };
}
function entorno() {
  const local = almacen();
  const temporal = almacen();
  const crear = () => crearAlmacenSesion(() => local, () => temporal);
  return { local, temporal, crear };
}

describe('sesiones compatibles con Supabase', () => {
  it.each([true, false])('conserva la elección recordar=%s tras volver del proveedor y renovar', (recordar) => {
    const { local, temporal, crear } = entorno();
    crear().elegirPersistencia(recordar);
    const retorno = crear();
    retorno.setItem('sb-proyecto-auth-token', 'sesion-ficticia');
    expect((recordar ? local : temporal).getItem('sb-proyecto-auth-token')).toBe('sesion-ficticia');
    expect((recordar ? temporal : local).getItem('sb-proyecto-auth-token')).toBeNull();
    const recarga = crear();
    expect(recarga.getItem('sb-proyecto-auth-token')).toBe('sesion-ficticia');
    recarga.setItem('sb-proyecto-auth-token', 'renovada');
    expect((recordar ? local : temporal).getItem('sb-proyecto-auth-token')).toBe('renovada');
  });

  it('lee y renueva sesiones persistentes existentes sin cambiar la clave', () => {
    const { local, temporal, crear } = entorno();
    local.setItem('sb-anterior-auth-token', 'anterior');
    const sesion = crear();
    expect(sesion.getItem('sb-anterior-auth-token')).toBe('anterior');
    sesion.setItem('sb-anterior-auth-token', 'renovada');
    expect(local.getItem('sb-anterior-auth-token')).toBe('renovada');
    expect(temporal.getItem('sb-anterior-auth-token')).toBeNull();
  });

  it('retira la sesión de ambos almacenes al salir y no afecta preferencias ajenas', () => {
    const { local, temporal, crear } = entorno();
    for (const destino of [local, temporal]) destino.setItem('token', 'sesion');
    local.setItem('oscila-tema', 'oscuro');
    crear().removeItem('token');
    expect(local.getItem('token')).toBeNull();
    expect(temporal.getItem('token')).toBeNull();
    expect(crear().getItem('token')).toBeNull();
    expect(local.getItem('oscila-tema')).toBe('oscuro');
  });

  it('el cambio de persona usa sesión temporal y retira la persistente anterior', () => {
    const { local, temporal, crear } = entorno();
    local.setItem('token', 'persona-anterior');
    const sesion = crear();
    sesion.elegirPersistencia(false);
    sesion.setItem('token', 'persona-siguiente');
    expect(local.getItem('token')).toBeNull();
    expect(temporal.getItem('token')).toBe('persona-siguiente');
  });

  it('funciona en memoria si el navegador bloquea el almacenamiento', () => {
    const bloqueado = () => { throw new Error('Bloqueado'); };
    const sesion = crearAlmacenSesion(bloqueado, bloqueado);
    sesion.elegirPersistencia(false);
    sesion.setItem('token', 'solo-memoria');
    expect(sesion.getItem('token')).toBe('solo-memoria');
    sesion.removeItem('token');
    expect(sesion.getItem('token')).toBeNull();
  });

  it('un almacén bloqueado no impide leer el otro', () => {
    const local = almacen();
    local.setItem('token', 'anterior');
    const sesion = crearAlmacenSesion(() => local, () => { throw new Error('Bloqueado'); });
    expect(sesion.getItem('token')).toBe('anterior');
  });
});

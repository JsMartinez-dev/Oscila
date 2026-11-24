import { describe, expect, it, vi } from 'vitest';
import { crearSolicitudUnica, ENLACE_VENCIDO, leerErrorRetorno, mensajeErrorAcceso, solicitarAcceso } from './autenticacion.js';

function servicio(data = { user: { id: 'cuenta-existente' }, session: null }) {
  const auth = Object.fromEntries(['signUp', 'signInWithPassword', 'resetPasswordForEmail', 'resend', 'signInWithOAuth', 'updateUser']
    .map((nombre) => [nombre, vi.fn().mockResolvedValue({ data, error: null })]));
  return { auth };
}
const datos = { email: 'persona@example.invalid', password: 'solo-una-prueba', destino: 'https://oscila.example.invalid/' };

describe('flujo administrado de acceso', () => {
  it('registra personas distintas sin una espera global artificial y conserva los metadatos', async () => {
    const cliente = servicio();
    const persistir = vi.fn();
    const enviar = crearSolicitudUnica();
    for (const nombre of ['Ana Pérez', 'Luis Díaz']) {
      await enviar(() => solicitarAcceso(cliente, { ...datos, email: `${nombre[0]}@example.invalid`, vista: 'registro', nombre, terminos: true }, persistir));
    }
    expect(cliente.auth.signUp).toHaveBeenCalledTimes(2);
    expect(cliente.auth.signUp.mock.calls[1][0]).toEqual({
      email: 'L@example.invalid', password: datos.password,
      options: { emailRedirectTo: datos.destino, data: { full_name: 'Luis Díaz', terms_accepted: true } },
    });
    expect(persistir).toHaveBeenCalledWith(false);
  });

  it.each([true, false])('inicia sesión conservando la opción recordar=%s y la identidad del proveedor', async (recordar) => {
    const respuesta = { user: { id: 'uuid-anterior' }, session: { access_token: 'ficticio' } };
    const cliente = servicio(respuesta);
    const persistir = vi.fn();
    expect(await solicitarAcceso(cliente, { ...datos, vista: 'ingreso', recordar }, persistir)).toBe(respuesta);
    expect(cliente.auth.signInWithPassword).toHaveBeenCalledWith({ email: datos.email, password: datos.password });
    expect(persistir).toHaveBeenCalledWith(recordar);
  });

  it('solicita recuperación con destino permitido y sesión temporal', async () => {
    const cliente = servicio();
    const persistir = vi.fn();
    await solicitarAcceso(cliente, { ...datos, vista: 'enlace' }, persistir);
    expect(cliente.auth.resetPasswordForEmail).toHaveBeenCalledWith(datos.email, { redirectTo: datos.destino });
    expect(persistir).toHaveBeenCalledWith(false);
  });

  it('reenvía la confirmación usando Auth sin crear otra cuenta', async () => {
    const cliente = servicio();
    await solicitarAcceso(cliente, { ...datos, vista: 'confirmacion' }, vi.fn());
    expect(cliente.auth.resend).toHaveBeenCalledWith({ type: 'signup', email: datos.email, options: { emailRedirectTo: datos.destino } });
    expect(cliente.auth.signUp).not.toHaveBeenCalled();
  });

  it('usa Google con selección de cuenta y sin enviar correo desde Oscila', async () => {
    const cliente = servicio();
    const persistir = vi.fn();
    await solicitarAcceso(cliente, { ...datos, vista: 'google', recordar: true }, persistir);
    expect(cliente.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: 'google', options: {
      redirectTo: datos.destino, queryParams: { prompt: 'select_account' },
    } });
    expect(persistir).toHaveBeenCalledWith(true);
    for (const metodo of ['signUp', 'resend', 'resetPasswordForEmail']) expect(cliente.auth[metodo]).not.toHaveBeenCalled();
  });

  it('actualiza contraseña a través del proveedor y propaga fallos', async () => {
    const cliente = servicio();
    await solicitarAcceso(cliente, { ...datos, vista: 'nueva-clave' }, vi.fn());
    expect(cliente.auth.updateUser).toHaveBeenCalledWith({ password: datos.password });
    const error = { code: 'email_not_confirmed' };
    cliente.auth.signInWithPassword.mockResolvedValue({ error });
    await expect(solicitarAcceso(cliente, { ...datos, vista: 'ingreso' }, vi.fn())).rejects.toBe(error);
  });

  it('bloquea solicitudes simultáneas antes de un render y permite la siguiente tras un fallo', async () => {
    const unica = crearSolicitudUnica();
    let rechazar;
    const primera = unica(() => new Promise((_, reject) => { rechazar = reject; }));
    const duplicada = vi.fn();
    expect(await unica(duplicada)).toEqual({ omitida: true });
    expect(duplicada).not.toHaveBeenCalled();
    const rechazo = expect(primera).rejects.toThrow('fallo');
    rechazar(new Error('fallo'));
    await rechazo;
    expect(await unica(() => 'siguiente')).toBe('siguiente');
  });
});

describe('errores útiles sin secretos ni tiempos inventados', () => {
  it('distingue límites de correo, solicitudes por IP y credenciales', () => {
    expect(mensajeErrorAcceso({ code: 'over_email_send_rate_limit' }, 'registro')).toContain('envío de correos');
    expect(mensajeErrorAcceso({ code: 'over_request_rate_limit' }, 'ingreso')).toContain('esta red');
    expect(mensajeErrorAcceso({ code: 'invalid_credentials' }, 'ingreso')).toContain('correo y la contraseña');
    expect(mensajeErrorAcceso({ code: 'email_address_not_authorized' }, 'registro')).toContain('configuración del envío');
  });
  it.each(['registro', 'ingreso', 'enlace', 'confirmacion', 'nueva-clave', 'google'])('el fallo genérico describe la operación %s sin copiar detalles privados', (vista) => {
    const mensaje = mensajeErrorAcceso({ message: 'password=secreto SMTP=privado' }, vista);
    expect(mensaje).not.toMatch(/secreto|privado|minutos|segundos/);
    expect(mensaje).toContain('No pudimos');
  });
  it('detecta recuperación vencida, problemas de red y límites sin código', () => {
    expect(mensajeErrorAcceso({ name: 'AuthSessionMissingError' }, 'nueva-clave')).toBe(ENLACE_VENCIDO);
    expect(mensajeErrorAcceso(new TypeError('fetch failed'), 'registro')).toContain('conexión');
    expect(mensajeErrorAcceso({ status: 429 }, 'ingreso')).toContain('limitado');
  });
  it('lee solo el código del retorno OAuth o de confirmación y no la descripción', () => {
    expect(leerErrorRetorno('https://oscila.example.invalid/#error=access_denied&error_description=privado')).toEqual({ code: 'access_denied' });
    expect(leerErrorRetorno('https://oscila.example.invalid/?error_code=otp_expired')).toEqual({ code: 'otp_expired' });
    expect(leerErrorRetorno('https://oscila.example.invalid/#access_token=ficticio')).toBeNull();
  });
});

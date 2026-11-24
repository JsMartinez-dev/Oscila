const ERRORES = {
  invalid_credentials: 'Revisa el correo y la contraseña e inténtalo de nuevo.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión. Puedes solicitar de nuevo la confirmación.',
  same_password: 'Elige una contraseña diferente de la que usabas antes.',
  weak_password: 'Elige una contraseña más fuerte e inténtalo de nuevo.',
  over_email_send_rate_limit: 'El servicio ha limitado el envío de correos. Evita repetir la solicitud. Si ocurre también con otras direcciones, comunícalo a soporte técnico.',
  over_request_rate_limit: 'Se alcanzó un límite de solicitudes de acceso. Evita los intentos repetidos; si varias personas usan esta red, comunícalo a soporte técnico.',
  email_address_not_authorized: 'El servicio de correo aún no permite enviar a esta dirección. Contacta con soporte técnico para completar la configuración del envío.',
  email_provider_disabled: 'El acceso por correo no está habilitado. Contacta con soporte técnico.',
  signup_disabled: 'El registro de cuentas no está habilitado. Contacta con soporte técnico.',
  provider_disabled: 'El acceso con Google no está habilitado. Usa correo y contraseña o contacta con soporte técnico.',
  oauth_provider_not_supported: 'El acceso con Google no está habilitado. Usa correo y contraseña o contacta con soporte técnico.',
  access_denied: 'No se completó el acceso con Google. Puedes volver a intentarlo o usar correo y contraseña.',
  bad_oauth_callback: 'No se pudo completar el regreso de Google. Inicia el acceso de nuevo.',
  bad_oauth_state: 'El acceso con Google ya no es válido. Inicia el acceso de nuevo.',
  provider_email_needs_verification: 'El proveedor requiere verificar tu correo. Revisa el mensaje de confirmación antes de entrar.',
  otp_expired: 'El enlace ya no es válido. Solicita uno nuevo desde la opción correspondiente.',
};

export const ENLACE_VENCIDO = 'La sesión de recuperación ya no es válida. Solicita un enlace nuevo.';
const ERRORES_DE_ENLACE = new Set([
  'bad_jwt', 'otp_expired', 'session_expired', 'session_not_found', 'refresh_token_not_found',
  'refresh_token_already_used', 'current_password_required', 'reauthentication_needed',
]);

export function esEnlaceVencido(error) {
  return ERRORES_DE_ENLACE.has(error?.code) || error?.name === 'AuthSessionMissingError';
}

export function mensajeErrorAcceso(error, vista) {
  if (vista === 'nueva-clave' && esEnlaceVencido(error)) return ENLACE_VENCIDO;
  if (Object.hasOwn(ERRORES, error?.code)) return ERRORES[error.code];
  if (error?.status === 429) return 'El servicio ha limitado esta solicitud. Evita repetirla y contacta con soporte técnico si el problema continúa.';
  if (error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) {
    return 'No pudimos conectar con el servicio de cuentas. Comprueba tu conexión antes de intentarlo de nuevo.';
  }
  const acciones = {
    ingreso: 'iniciar sesión', registro: 'solicitar el registro y su correo de confirmación',
    confirmacion: 'solicitar el correo de confirmación', enlace: 'solicitar el correo de recuperación',
    'nueva-clave': 'guardar la contraseña', google: 'iniciar el acceso con Google',
  };
  return `No pudimos ${acciones[vista] || 'completar la solicitud'}. Inténtalo de nuevo; si continúa, contacta con soporte técnico.`;
}

export function crearSolicitudUnica() {
  let ocupada = false;
  return async (operacion) => {
    if (ocupada) return { omitida: true };
    ocupada = true;
    try {
      return await operacion();
    } finally {
      ocupada = false;
    }
  };
}

export async function solicitarAcceso(cliente, datos, persistir) {
  const { vista, email, password, destino } = datos;
  let respuesta;
  if (vista === 'registro') {
    persistir(false);
    respuesta = await cliente.auth.signUp({ email, password, options: {
      emailRedirectTo: destino,
      data: { full_name: datos.nombre, terms_accepted: datos.terminos },
    } });
  } else if (vista === 'ingreso') {
    persistir(Boolean(datos.recordar));
    respuesta = await cliente.auth.signInWithPassword({ email, password });
  } else if (vista === 'enlace') {
    persistir(false);
    respuesta = await cliente.auth.resetPasswordForEmail(email, { redirectTo: destino });
  } else if (vista === 'confirmacion') {
    respuesta = await cliente.auth.resend({ type: 'signup', email, options: { emailRedirectTo: destino } });
  } else if (vista === 'google') {
    persistir(Boolean(datos.recordar));
    respuesta = await cliente.auth.signInWithOAuth({ provider: 'google', options: {
      redirectTo: destino, queryParams: { prompt: 'select_account' },
    } });
  } else if (vista === 'nueva-clave') {
    respuesta = await cliente.auth.updateUser({ password });
  } else {
    throw new Error('Operación de acceso desconocida.');
  }
  if (respuesta.error) throw respuesta.error;
  return respuesta.data;
}

export function leerErrorRetorno(url) {
  const direccion = new URL(url);
  const fragmento = new URLSearchParams(direccion.hash.slice(1));
  const codigo = fragmento.get('error_code') || direccion.searchParams.get('error_code');
  const error = fragmento.get('error') || direccion.searchParams.get('error');
  if (!codigo && !error) return null;
  return { code: codigo || error };
}

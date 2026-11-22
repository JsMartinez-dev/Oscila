import { useState, useRef } from 'react';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import '@fontsource-variable/plus-jakarta-sans';
import { elegirPersistenciaSesion, supabase } from '../servicios/supabase.js';
import Creditos from '../pages/Creditos.jsx';
import './Cuenta.css';

const MODOS = { ingreso: 'Iniciar sesión', registro: 'Registrarse' };
const LOGO = `${import.meta.env.BASE_URL}logotipos/LOGOTIPO-NOMBRE.svg`;
const ENLACE_VENCIDO = 'La sesión de recuperación ya no es válida. Solicita un enlace nuevo.';
const ERRORES_DE_ENLACE = new Set([
  'bad_jwt', 'otp_expired', 'session_expired', 'session_not_found', 'refresh_token_not_found',
  'refresh_token_already_used', 'current_password_required', 'reauthentication_needed',
]);
const ERRORES = {
  invalid_credentials: 'Revisa el correo y la contraseña e inténtalo de nuevo.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión.',
  same_password: 'Elige una contraseña diferente de la que usabas antes.',
  weak_password: 'Elige una contraseña más fuerte e inténtalo de nuevo.',
  over_email_send_rate_limit: 'Espera unos minutos antes de volver a solicitar un correo.',
  over_request_rate_limit: 'Espera unos minutos antes de intentarlo de nuevo.',
};

export default function Cuenta({ cargando, recuperar, sesionDisponible, onSalirRecuperacion }) {
  const [modo, setModo] = useState('ingreso');
  const [correo, setCorreo] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [ayuda, setAyuda] = useState(null);
  const dialogo = useRef(null);

  const cambiarClave = recuperar && sesionDisponible && modo !== 'enlace';
  const vista = cambiarClave ? 'nueva-clave' : recuperar ? 'enlace' : modo;
  const registro = vista === 'registro';
  const ingreso = vista === 'ingreso';
  const solicitarEnlace = vista === 'enlace';
  const titulo = cambiarClave ? 'Crea una nueva contraseña' : 'Acceso a la plataforma';
  const accion = { ingreso: 'Entrar a Oscila', registro: 'Crear cuenta en Oscila', enlace: 'Enviar enlace', 'nueva-clave': 'Guardar contraseña' }[vista];
  const IconoClave = mostrarClave ? EyeSlashIcon : EyeIcon;

  function cambiarModo(siguiente) {
    setModo(siguiente);
    setMostrarClave(false);
    setAviso('');
    setError('');
  }

  function moverPestana(evento) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(evento.key)) return;
    evento.preventDefault();
    const botones = [...evento.currentTarget.querySelectorAll('[role="tab"]')];
    const siguiente = evento.key === 'Home' ? botones[0] : evento.key === 'End' ? botones[1] : botones.find((boton) => boton !== evento.target);
    siguiente.click();
    siguiente.focus();
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!supabase || ocupado) return;
    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);
    const email = campos.get('email')?.trim();
    const password = campos.get('password');
    const destino = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    setOcupado(true);
    setAviso('');
    setError('');

    try {
      if (cambiarClave) {
        const { error: fallo } = await supabase.auth.updateUser({ password });
        if (fallo) throw fallo;
        onSalirRecuperacion();
      } else if (solicitarEnlace) {
        const { error: fallo } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: destino });
        if (fallo) throw fallo;
        setAviso('Si el correo está registrado, recibirás un enlace para restablecer la contraseña.');
      } else if (registro) {
        const nombre = campos.get('nombre').trim();
        if (!nombre) {
          setError('Escribe tu nombre y apellidos.');
          formulario.elements.nombre.focus();
          return;
        }
        elegirPersistenciaSesion(false);
        const { data, error: fallo } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: destino,
            data: { full_name: nombre, terms_accepted: campos.has('terminos') },
          },
        });
        if (fallo) throw fallo;
        if (!data.session) {
          cambiarModo('ingreso');
          setCorreo(email);
          setAviso('Revisa tu correo para confirmar tu cuenta. Luego podrás iniciar sesión.');
        }
      } else {
        elegirPersistenciaSesion(campos.has('recordar'));
        const { error: fallo } = await supabase.auth.signInWithPassword({ email, password });
        if (fallo) throw fallo;
      }
    } catch (fallo) {
      const codigo = fallo?.code;
      if (cambiarClave && (ERRORES_DE_ENLACE.has(codigo) || fallo?.name === 'AuthSessionMissingError')) {
        cambiarModo('enlace');
        setError(ENLACE_VENCIDO);
      } else if (Object.hasOwn(ERRORES, codigo)) {
        setError(ERRORES[codigo]);
      } else if (cambiarClave) {
        const detalle = typeof codigo === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(codigo) ? ` Código: ${codigo}.` : '';
        setError(`No pudimos guardar la contraseña. Inténtalo de nuevo.${detalle}`);
      } else {
        setError('No pudimos completar la solicitud. Inténtalo de nuevo.');
      }
    } finally {
      setOcupado(false);
    }
  }

  function mostrarAyuda(seccion) {
    setAyuda(seccion);
    dialogo.current.showModal();
  }

  return (
    <div className="acceso">
      <header className="acceso-barra">
        <img src={LOGO} alt="Oscila" />
      </header>

      <main className="acceso-contenido">
        <div className="acceso-marca">
          <img src={LOGO} alt="" />
          <p>Física que se ve y se calcula</p>
        </div>

        <section className="acceso-tarjeta" aria-labelledby="acceso-titulo">
          <h1 id="acceso-titulo">{titulo}</h1>

          {!recuperar && !solicitarEnlace && (
            <div className="acceso-selector" role="tablist" aria-label="Tipo de acceso" onKeyDown={moverPestana}>
              {Object.entries(MODOS).map(([id, etiqueta]) => (
                <button
                  key={id} id={`acceso-tab-${id}`} type="button" role="tab"
                  aria-selected={modo === id} aria-controls={`acceso-panel-${id}`}
                  tabIndex={modo === id ? 0 : -1} disabled={ocupado} onClick={() => cambiarModo(id)}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          )}

          {solicitarEnlace && <h2 className="acceso-subtitulo">Restablecer contraseña</h2>}
          {Object.keys(MODOS).filter((id) => id !== vista).map((id) => (
            <div key={id} id={`acceso-panel-${id}`} role="tabpanel" aria-labelledby={`acceso-tab-${id}`} hidden />
          ))}
          <form
            key={vista} method="post" className={`acceso-form acceso-form--${vista}`} onSubmit={enviar}
            id={`acceso-panel-${vista}`} role={ingreso || registro ? 'tabpanel' : undefined}
            aria-labelledby={ingreso || registro ? `acceso-tab-${vista}` : 'acceso-titulo'}
          >
            {registro && (
              <div className="acceso-campo">
                <label htmlFor="acceso-nombre">Nombre y apellidos</label>
                <input id="acceso-nombre" name="nombre" autoComplete="name" placeholder="Ej. Ana Milena Pérez" maxLength={120} required readOnly={ocupado} />
              </div>
            )}

            {!cambiarClave && (
              <div className="acceso-campo">
                <label htmlFor="acceso-email">Correo electrónico</label>
                <input
                  id="acceso-email" name="email" type="email" autoComplete="username" spellCheck={false}
                  placeholder={registro ? 'ejemplo@gmail.com' : 'cuenta@ejemplo.com'}
                  value={correo} onChange={(evento) => setCorreo(evento.target.value)} required readOnly={ocupado}
                />
              </div>
            )}

            {!solicitarEnlace && (
              <div className="acceso-campo">
                <div className="acceso-etiqueta">
                  <label htmlFor="acceso-clave">{ingreso ? 'Contraseña' : 'Crear contraseña'}</label>
                  {ingreso && (
                    <button type="button" className="acceso-enlace" disabled={ocupado} onClick={() => cambiarModo('enlace')}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="acceso-clave">
                  <input
                    id="acceso-clave" name="password" type={mostrarClave ? 'text' : 'password'}
                    autoComplete={ingreso ? 'current-password' : 'new-password'} minLength={ingreso ? undefined : 8}
                    placeholder={ingreso ? '••••••••••••' : 'Mínimo 8 caracteres'} required readOnly={ocupado}
                  />
                  <button type="button" aria-label="Mostrar contraseña" aria-pressed={mostrarClave} onClick={() => setMostrarClave(!mostrarClave)}>
                    <IconoClave aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {ingreso && (
              <label className="acceso-opcion">
                <input type="checkbox" name="recordar" disabled={ocupado} />
                <span>Mantener mi sesión activa en este equipo</span>
              </label>
            )}

            {registro && (
              <label className="acceso-opcion">
                <input type="checkbox" name="terminos" required disabled={ocupado} />
                <span>Acepto los términos de uso y tratamiento de datos para fines académicos de la Unimagdalena.</span>
              </label>
            )}

            <button className="acceso-enviar" type="submit" disabled={ocupado || cargando || !supabase}>
              {ocupado ? 'Enviando…' : accion}
              <ArrowRightIcon aria-hidden="true" />
            </button>

            {solicitarEnlace && (!recuperar || !sesionDisponible) && (
              <button type="button" className="acceso-enlace acceso-volver" disabled={ocupado} onClick={() => {
                cambiarModo('ingreso');
                if (recuperar) onSalirRecuperacion();
              }}>
                Volver a iniciar sesión
              </button>
            )}
          </form>

          <div className="acceso-estado">
            <p role="alert" className="acceso-error">{error || (recuperar && !sesionDisponible && !aviso ? ENLACE_VENCIDO : '')}</p>
            <p role="status">{!supabase ? 'El servicio de cuentas todavía no está disponible.' : cargando ? 'Comprobando la sesión…' : aviso}</p>
          </div>
        </section>
      </main>

      <footer className="acceso-pie">
        <span className="acceso-pie-marca">Oscila ·</span>
        <nav aria-label="Información de Oscila">
          <button type="button" onClick={() => mostrarAyuda('creditos')}>Créditos</button>
          <button type="button" onClick={() => mostrarAyuda('soporte')}>Soporte técnico</button>
        </nav>
      </footer>

      <dialog ref={dialogo} className="acceso-dialogo" aria-label={ayuda === 'creditos' ? 'Créditos' : 'Soporte técnico'}>
        <form method="dialog"><button type="submit" className="btn">Cerrar</button></form>
        {ayuda === 'creditos' ? <Creditos /> : (
          <div>
            <h2>Soporte técnico</h2>
            <p>Si encuentras un problema en Oscila, puedes reportarlo en el repositorio del proyecto.</p>
            <a href="https://github.com/JsMartinez-dev/CalorYondas-v1/issues" target="_blank" rel="noreferrer">Reportar un problema en GitHub</a>
          </div>
        )}
      </dialog>
    </div>
  );
}

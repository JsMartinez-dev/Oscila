import { useState, useRef } from 'react';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import '@fontsource-variable/plus-jakarta-sans';
import { elegirPersistenciaSesion, googleHabilitado, supabase } from '../servicios/supabase.js';
import { crearSolicitudUnica, ENLACE_VENCIDO, esEnlaceVencido, mensajeErrorAcceso, solicitarAcceso } from '../servicios/autenticacion.js';
import Creditos from '../pages/Creditos.jsx';
import './Cuenta.css';

const MODOS = { ingreso: 'Iniciar sesión', registro: 'Registrarse' };
const LOGO = `${import.meta.env.BASE_URL}logotipos/LOGOTIPO-NOMBRE.svg`;
export default function Cuenta({ cargando, recuperar, sesionDisponible, onSalirRecuperacion, errorRetorno }) {
  const [modo, setModo] = useState('ingreso');
  const [correo, setCorreo] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState(() => errorRetorno ? mensajeErrorAcceso(errorRetorno, 'ingreso') : '');
  const [ayuda, setAyuda] = useState(null);
  const dialogo = useRef(null);
  const formulario = useRef(null);
  const solicitudUnica = useRef(crearSolicitudUnica());

  const cambiarClave = recuperar && sesionDisponible && modo !== 'enlace';
  const vista = cambiarClave ? 'nueva-clave' : recuperar ? 'enlace' : modo;
  const registro = vista === 'registro';
  const ingreso = vista === 'ingreso';
  const solicitarEnlace = vista === 'enlace';
  const confirmacion = vista === 'confirmacion';
  const titulo = cambiarClave ? 'Crea una nueva contraseña' : 'Acceso a la plataforma';
  const accion = { ingreso: 'Entrar a Oscila', registro: 'Crear cuenta en Oscila', enlace: 'Enviar enlace', confirmacion: 'Solicitar otra confirmación', 'nueva-clave': 'Guardar contraseña' }[vista];
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
    if (!supabase || cargando) return;
    const campos = new FormData(evento.currentTarget);
    const email = campos.get('email')?.trim();
    const nombre = campos.get('nombre')?.trim();
    if (registro && !nombre) {
      setError('Escribe tu nombre y apellidos.');
      formulario.current.elements.nombre.focus();
      return;
    }
    await ejecutar(vista, { email, nombre, password: campos.get('password'),
      terminos: campos.has('terminos'), recordar: campos.has('recordar') });
  }

  async function ejecutar(operacion, datos) {
    if (!supabase || cargando) return;
    await solicitudUnica.current(async () => {
      setOcupado(true);
      setAviso('');
      setError('');
      try {
        const data = await solicitarAcceso(supabase, { ...datos, vista: operacion,
          destino: new URL(import.meta.env.BASE_URL, window.location.origin).href,
        }, elegirPersistenciaSesion);
        if (operacion === 'nueva-clave') onSalirRecuperacion();
        if (operacion === 'enlace') {
          setAviso('Si el correo está registrado, recibirás un enlace para restablecer la contraseña. Revisa también el correo no deseado.');
        }
        if ((operacion === 'registro' && !data?.session) || operacion === 'confirmacion') {
          cambiarModo('confirmacion');
          setCorreo(datos.email);
          setAviso('Si la dirección puede registrarse, recibirás un enlace de confirmación. Revisa también el correo no deseado. Si ya tienes cuenta, inicia sesión o recupera tu contraseña.');
        }
      } catch (fallo) {
        if (operacion === 'nueva-clave' && esEnlaceVencido(fallo)) cambiarModo('enlace');
        setError(mensajeErrorAcceso(fallo, operacion));
      } finally {
        setOcupado(false);
      }
    });
  }

  async function entrarConGoogle() {
    const campos = new FormData(formulario.current);
    if (registro && !campos.has('terminos')) {
      formulario.current.elements.terminos.reportValidity();
      return;
    }
    await ejecutar('google', { recordar: campos.has('recordar') });
  }

  function registrarOtraPersona() {
    setCorreo('');
    cambiarModo('registro');
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

          {!recuperar && !solicitarEnlace && !confirmacion && (
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
            ref={formulario} aria-busy={ocupado}
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

            {confirmacion && <p className="acceso-instruccion">Confirma tu correo para entrar con contraseña. Puedes registrar a otra persona mientras esperas tu mensaje.</p>}

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

            {!solicitarEnlace && !confirmacion && (
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

            {googleHabilitado && (ingreso || registro) && (
              <div className="acceso-google">
                <span>o continúa con tu cuenta de Google</span>
                <button type="button" className="acceso-enviar acceso-enviar--google" onClick={entrarConGoogle} disabled={ocupado || cargando || !supabase}>
                  Continuar con Google
                </button>
                <p>Google verifica tu identidad. Este acceso no necesita un correo de confirmación de Oscila.</p>
              </div>
            )}

            {confirmacion && (
              <>
                <button type="button" className="acceso-enlace" disabled={ocupado} onClick={registrarOtraPersona}>Registrar a otra persona</button>
                <button type="button" className="acceso-enlace" disabled={ocupado} onClick={() => cambiarModo('ingreso')}>Volver a iniciar sesión</button>
              </>
            )}

            {ingreso && (
              <button type="button" className="acceso-enlace" disabled={ocupado} onClick={() => cambiarModo('confirmacion')}>¿Necesitas confirmar tu correo?</button>
            )}

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

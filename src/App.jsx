import { useCallback, useEffect, useRef, useState } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import BarraLateral, { Marca } from "./components/BarraLateral";
import Inicio from "./pages/Inicio";
import Montaje from "./pages/Montaje";
import Ejercicios from "./pages/Ejercicios";
import Teoria from "./pages/Teoria";
import Aplicaciones from "./pages/Aplicaciones";
import TestInteractivo from "./pages/TestInteractivo";
import COPortada from "./pages/calor-ondas/Portada";
import COMarco from "./pages/calor-ondas/MarcoConceptual";
import COAplicaciones from "./pages/calor-ondas/Aplicaciones";
import COLaboratorio from "./pages/calor-ondas/Laboratorio";
import COEjercicios from "./pages/calor-ondas/Ejercicios";
import COTest from "./pages/calor-ondas/Test";
import Creditos from "./pages/Creditos";
import { useModoFeria } from "./components/ModoFeria";
import Cuenta from "./components/Cuenta.jsx";
import { supabase } from "./servicios/supabase.js";
import { leerErrorRetorno } from "./servicios/autenticacion.js";

const PAGES = {
  inicio: Inicio,
  teoria: Teoria,
  ejemplos: Aplicaciones,
  montaje: Montaje,
  ejercicios: Ejercicios,
  test: TestInteractivo,
  "co-inicio": COPortada,
  "co-teoria": COMarco,
  "co-aplicaciones": COAplicaciones,
  "co-laboratorio": COLaboratorio,
  "co-ejercicios": COEjercicios,
  "co-test": COTest,
  creditos: Creditos,
};

// Desde este ancho la barra lateral queda fija; por debajo es un cajón (igual que en index.css)
const ESCRITORIO = "(min-width: 1024px)";
const CLAVE_TEMA = "oscila-tema";

export default function App() {
  const [sesion, setSesion] = useState(supabase ? undefined : null);
  const [recuperar, setRecuperar] = useState(false);
  const [errorRetorno] = useState(() => leerErrorRetorno(window.location.href));

  useEffect(() => {
    if (!supabase) return;
    if (errorRetorno) {
      const url = new URL(window.location.href);
      for (const clave of ['error', 'error_code', 'error_description']) url.searchParams.delete(clave);
      const fragmento = new URLSearchParams(url.hash.slice(1));
      for (const clave of ['error', 'error_code', 'error_description']) fragmento.delete(clave);
      url.hash = fragmento.toString();
      window.history.replaceState(null, '', url);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evento, sesionActual) => {
      setSesion(sesionActual);
      if (evento === "PASSWORD_RECOVERY") setRecuperar(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!sesion || recuperar) {
    return (
      <Cuenta
        cargando={sesion === undefined}
        recuperar={recuperar}
        sesionDisponible={Boolean(sesion)}
        onSalirRecuperacion={() => setRecuperar(false)}
        errorRetorno={errorRetorno}
      />
    );
  }

  return <Plataforma sesion={sesion} />;
}

function Plataforma({ sesion }) {
  const [activePage, setActivePage] = useState("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [errorSesion, setErrorSesion] = useState("");
  const [temaOscuro, setTemaOscuro] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_TEMA) === "oscuro";
    } catch {
      return false;
    }
  });
  const botonMenu = useRef(null);
  const feria = useModoFeria();
  const PageComponent = PAGES[activePage];
  const nombre = sesion.user.user_metadata?.full_name || sesion.user.user_metadata?.name || sesion.user.email || 'Mi cuenta';
  const IconoTema = temaOscuro ? SunIcon : MoonIcon;

  function alternarTema() {
    const siguiente = !temaOscuro;
    setTemaOscuro(siguiente);
    try {
      localStorage.setItem(CLAVE_TEMA, siguiente ? "oscuro" : "claro");
    } catch {
      // El tema sigue activo en esta página si el navegador bloquea el almacenamiento.
    }
  }

  async function cerrarSesion() {
    setCerrandoSesion(true);
    setErrorSesion("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      setErrorSesion("No pudimos cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setCerrandoSesion(false);
    }
  }

  const navegar = useCallback((pagina) => {
    setActivePage(pagina);
    setMenuAbierto(false);
    window.scrollTo({ top: 0 });
  }, []);

  const cerrarMenu = useCallback(() => {
    setMenuAbierto(false);
    // el contenido deja de ser inerte en el siguiente render; entonces vuelve el foco al botón
    requestAnimationFrame(() => botonMenu.current?.focus());
  }, []);

  // Calor y Ondas está en revisión: no se muestra en modo feria
  useEffect(() => {
    if (feria.activo && activePage.startsWith("co-")) setActivePage("inicio");
  }, [feria.activo, activePage]);

  // Si la ventana pasa a escritorio con el cajón abierto, se cierra
  useEffect(() => {
    const mq = window.matchMedia(ESCRITORIO);
    const cambio = () => mq.matches && setMenuAbierto(false);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);

  return (
    <div className="app-shell" data-tema={temaOscuro ? "oscuro" : "claro"}>
      <BarraLateral
        id="barra-lateral"
        activePage={activePage}
        onNavigate={navegar}
        feria={feria}
        abierto={menuAbierto}
        onCerrar={cerrarMenu}
      />
      {menuAbierto && <div className="velo" onClick={cerrarMenu} aria-hidden="true" />}

      <div className="app-principal" inert={menuAbierto ? "" : undefined}>
        <header className="barra-movil">
          <Marca />
          <button
            ref={botonMenu}
            type="button"
            className="btn barra-movil-menu"
            onClick={() => setMenuAbierto(true)}
            aria-expanded={menuAbierto}
            aria-controls="barra-lateral"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menú
          </button>
        </header>
        <div className="page-content plataforma-cuenta" aria-label="Mi cuenta">
          <strong>{nombre}</strong>
          <button type="button" className="btn plataforma-tema" onClick={alternarTema}>
            <IconoTema aria-hidden="true" />
            {temaOscuro ? "Modo claro" : "Modo oscuro"}
          </button>
          <button type="button" className="btn" onClick={cerrarSesion} disabled={cerrandoSesion}>
            {cerrandoSesion ? "Cerrando sesión…" : "Cerrar sesión"}
          </button>
          {errorSesion && <p role="alert">{errorSesion}</p>}
        </div>
        <main className="page-content">
          {activePage !== "inicio" && activePage !== "co-inicio" && (
            <button type="button" className="boton-inicio" onClick={() => navegar("inicio")} title="Ir al inicio" aria-label="Ir al inicio">
              <img src="/logotipos/house-logo.svg" alt="" aria-hidden="true" />
            </button>
          )}
          <PageComponent onNavigate={navegar} feria={feria.activo} />
        </main>
      </div>
    </div>
  );
}

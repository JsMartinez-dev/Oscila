import { useCallback, useEffect, useRef, useState } from "react";
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
import { useModoFeria } from "./components/ModoFeria";

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
};

// Desde este ancho la barra lateral queda fija; por debajo es un cajón (igual que en index.css)
const ESCRITORIO = "(min-width: 1024px)";

export default function App() {
  const [activePage, setActivePage] = useState("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenu = useRef(null);
  const feria = useModoFeria();
  const PageComponent = PAGES[activePage];

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
    <div className="app-shell">
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
        <main className="page-content">
          <PageComponent onNavigate={navegar} feria={feria.activo} />
        </main>
      </div>
    </div>
  );
}

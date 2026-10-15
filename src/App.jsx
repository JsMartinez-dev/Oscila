import { useCallback, useState } from "react";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Montaje from "./pages/Montaje";
import Ejercicios from "./pages/Ejercicios";
import Teoria from "./pages/Teoria";
import Aplicaciones from "./pages/Aplicaciones";
import TestInteractivo from "./pages/TestInteractivo";

const PAGES = {
  inicio: Inicio,
  teoria: Teoria,
  ejemplos: Aplicaciones,
  montaje: Montaje,
  ejercicios: Ejercicios,
  test: TestInteractivo,
};

export default function App() {
  const [activePage, setActivePage] = useState("inicio");
  const PageComponent = PAGES[activePage];
  const navegar = useCallback((pagina) => {
    setActivePage(pagina);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={navegar} />
      <main className="page-content">
        <PageComponent onNavigate={navegar} />
      </main>
      <footer className="site-footer">
        <span>Circuitos en Vivo — Electricidad y Magnetismo</span>
        <span className="footer-sep">·</span>
        <span>Universidad del Magdalena</span>
      </footer>
    </div>
  );
}

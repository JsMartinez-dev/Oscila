import { useState } from "react";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Montaje from "./pages/Montaje";
import TestInteractivo from "./pages/TestInteractivo";

function EnConstruccion({ titulo }) {
  return (
    <div style={{ maxWidth: 800, margin: "3rem auto", padding: "0 1.25rem" }}>
      <h1>{titulo}</h1>
      <p style={{ color: "var(--text-secondary)" }}>Sección en construcción.</p>
    </div>
  );
}

const PAGES = {
  inicio: Inicio,
  teoria: () => <EnConstruccion titulo="Teoría" />,
  ejemplos: () => <EnConstruccion titulo="Aplicaciones en ingeniería" />,
  montaje: Montaje,
  ejercicios: () => <EnConstruccion titulo="Ejercicios" />,
  test: TestInteractivo,
};

export default function App() {
  const [activePage, setActivePage] = useState("inicio");
  const PageComponent = PAGES[activePage];

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="page-content">
        <PageComponent onNavigate={setActivePage} />
      </main>
      <footer className="site-footer">
        <span>Circuitos en Vivo — Electricidad y Magnetismo</span>
        <span className="footer-sep">·</span>
        <span>Universidad del Magdalena</span>
      </footer>
    </div>
  );
}

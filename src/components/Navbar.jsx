const NAV_ITEMS = [
  {
    id: "inicio",
    label: "Inicio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    description: "Portada del proyecto",
  },
  {
    id: "teoria",
    label: "Teoría",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
    description: "Potencial, capacitancia, circuitos y Kirchhoff",
  },
  {
    id: "ejemplos",
    label: "Aplicaciones",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    description: "Ingeniería aplicada",
  },
  {
    id: "montaje",
    label: "Montaje",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M9 3v6l-5 9a2 2 0 001.8 3h12.4A2 2 0 0020 18l-5-9V3"/>
      </svg>
    ),
    description: "Dibuja o fotografía un circuito y resuélvelo",
  },
  {
    id: "ejercicios",
    label: "Ejercicios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    description: "Práctica guiada",
  },
  {
    id: "test",
    label: "Test Interactivo",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 9h.01M15 9h.01M9 15h6M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z"/>
      </svg>
    ),
    description: "Evaluación de conocimientos",
  },
];

export default function Navbar({ activePage, onNavigate, feria }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">Circuitos en Vivo</span>
          <span className="brand-subtitle">Electricidad y Magnetismo</span>
        </div>
      </div>

      <nav className="navbar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "nav-item--active" : ""}`}
            onClick={() => onNavigate(item.id)}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      {feria && (
        <button
          className={`nav-item nav-feria ${feria.activo ? "nav-item--active" : ""}`}
          onClick={feria.alternar}
          title="Pantalla completa y letra grande (tecla F)"
          aria-pressed={feria.activo}
        >
          <span className="nav-icon">⛶</span>
          <span className="nav-label">{feria.activo ? "Salir" : "Feria"}</span>
        </button>
      )}
    </header>
  );
}
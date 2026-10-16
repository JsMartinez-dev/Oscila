// Barra lateral: módulos de la plataforma y secciones de Electricidad y Magnetismo.
// En escritorio queda fija a la izquierda; en celular y tableta es un cajón que abre el botón "Menú".

import { useEffect, useRef } from 'react';
import { ETIQUETA_ESTADO, modulosVisibles } from '../contenido/modulos.js';
import { ContadorFeria } from './ModoFeria.jsx';

const svg = (hijos) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {hijos}
  </svg>
);

const SECCIONES = [
  {
    id: 'inicio',
    label: 'Inicio',
    descripcion: 'Portada de la plataforma',
    icon: svg(
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>,
    ),
  },
  {
    id: 'teoria',
    label: 'Teoría',
    descripcion: 'Potencial, capacitancia, circuitos y Kirchhoff',
    icon: svg(
      <>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </>,
    ),
  },
  {
    id: 'ejemplos',
    label: 'Aplicaciones',
    descripcion: 'Ingeniería aplicada',
    icon: svg(
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>,
    ),
  },
  {
    id: 'montaje',
    label: 'Montaje',
    descripcion: 'Dibuja o fotografía un circuito y resuélvelo',
    icon: svg(<path d="M9 3h6M9 3v6l-5 9a2 2 0 001.8 3h12.4A2 2 0 0020 18l-5-9V3" />),
  },
  {
    id: 'ejercicios',
    label: 'Ejercicios',
    descripcion: 'Ejercicios resueltos paso a paso',
    icon: svg(<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />),
  },
  {
    id: 'test',
    label: 'Test',
    descripcion: 'Evaluación de conocimientos',
    icon: svg(<path d="M9 9h.01M15 9h.01M9 15h6M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" />),
  },
];

const ICONO_MODULO = {
  electricidad: svg(<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />),
  'calor-ondas': svg(<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />),
  mecanica: svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>,
  ),
};

export function Marca() {
  return (
    <div className="marca">
      <span className="marca-icono" aria-hidden="true">
        {ICONO_MODULO.electricidad}
      </span>
      <span className="marca-texto">
        <span className="marca-titulo">Circuitos en Vivo</span>
        <span className="marca-sub">Plataforma de física</span>
      </span>
    </div>
  );
}

export default function BarraLateral({ id, activePage, onNavigate, feria, abierto, onCerrar }) {
  const ref = useRef(null);

  // Al abrir el cajón, el foco entra en él; Esc lo cierra y Tab da la vuelta sin salir de él
  // (el resto de la página queda inerte desde App)
  useEffect(() => {
    if (!abierto) return undefined;
    ref.current?.querySelector('button:not([disabled])')?.focus();
    const tecla = (ev) => {
      if (ev.key === 'Escape') {
        onCerrar();
        return;
      }
      if (ev.key !== 'Tab' || !ref.current) return;
      const enfocables = [...ref.current.querySelectorAll('button:not([disabled])')].filter((b) => b.offsetParent !== null);
      if (!enfocables.length) return;
      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];
      const dentro = ref.current.contains(document.activeElement);
      if (ev.shiftKey && (document.activeElement === primero || !dentro)) {
        ev.preventDefault();
        ultimo.focus();
      } else if (!ev.shiftKey && (document.activeElement === ultimo || !dentro)) {
        ev.preventDefault();
        primero.focus();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [abierto, onCerrar]);

  const moduloActivo = activePage === 'calor-ondas' ? 'calor-ondas' : 'electricidad';

  return (
    <aside id={id} ref={ref} className={`lateral${abierto ? ' lateral--abierta' : ''}`} aria-label="Navegación principal">
      <div className="lateral-cabecera">
        <Marca />
        <button type="button" className="lateral-cerrar" onClick={onCerrar} aria-label="Cerrar menú">
          {svg(<path d="M6 6l12 12M18 6L6 18" />)}
        </button>
      </div>

      <nav className="lateral-bloque" aria-labelledby="lateral-modulos">
        <h2 id="lateral-modulos" className="lateral-titulo">
          Módulos
        </h2>
        <ul>
          {modulosVisibles(feria?.activo).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`lateral-modulo${moduloActivo === m.id ? ' lateral-modulo--activo' : ''}`}
                onClick={() => m.ruta && onNavigate(m.ruta)}
                disabled={!m.ruta}
                aria-current={moduloActivo === m.id ? 'true' : undefined}
              >
                <span className="lateral-icono">{ICONO_MODULO[m.id]}</span>
                <span className="lateral-texto">
                  {m.nombre}
                  {ETIQUETA_ESTADO[m.estado] && <span className={`pildora pildora--${m.estado}`}>{ETIQUETA_ESTADO[m.estado]}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="lateral-bloque" aria-labelledby="lateral-secciones">
        <h2 id="lateral-secciones" className="lateral-titulo">
          Electricidad y Magnetismo
        </h2>
        <ul>
          {SECCIONES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`lateral-item${activePage === s.id ? ' lateral-item--activo' : ''}`}
                onClick={() => onNavigate(s.id)}
                title={s.descripcion}
                aria-current={activePage === s.id ? 'page' : undefined}
              >
                <span className="lateral-icono">{s.icon}</span>
                <span className="lateral-texto">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {feria && (
        <div className="lateral-pie">
          {/* En feria, el contador va aquí y no fijo sobre la página, para no tapar la hoja de solución */}
          {feria.activo && <ContadorFeria />}
          <button type="button" className="btn lateral-feria" onClick={feria.alternar} title="Pantalla completa y letra grande (tecla F)" aria-pressed={feria.activo}>
            <span aria-hidden="true">⛶</span> {feria.activo ? 'Salir de feria' : 'Modo feria'}
          </button>
        </div>
      )}
    </aside>
  );
}

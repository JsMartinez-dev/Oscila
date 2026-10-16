// Teoría: potencial eléctrico, capacitancia, resistencia y circuitos, y leyes de Kirchhoff (según la hoja de fórmulas).

import { useState } from 'react';
import Markdown from '../components/Markdown.jsx';
import { TEORIA } from '../contenido/teoria.js';
import './Contenido.css';

export default function Teoria({ onNavigate }) {
  const [abierta, setAbierta] = useState(TEORIA[0].id);
  return (
    <div className="contenido">
      <header className="contenido-cabecera">
        <h1>Teoría</h1>
        <p>Las fórmulas y la convención de signos que usa el curso (y que sigue el montaje virtual al resolver cada circuito).</p>
      </header>
      <div className="contenido-indice">
        {TEORIA.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={abierta === t.id ? 'activa' : ''}
            aria-current={abierta === t.id ? 'true' : undefined}
            onClick={() => setAbierta(t.id)}
          >
            <span className="contenido-num">{i + 1}</span>
            <span>
              <strong>{t.titulo}</strong>
              <small>{t.resumen}</small>
            </span>
          </button>
        ))}
      </div>
      {TEORIA.filter((t) => t.id === abierta).map((t) => (
        <article key={t.id} className="hoja contenido-hoja">
          <h2>
            {TEORIA.indexOf(t) + 1}. {t.titulo}
          </h2>
          <Markdown>{t.md}</Markdown>
          {(t.id === 'circuitos' || t.id === 'kirchhoff') && (
            <button type="button" className="contenido-accion" onClick={() => onNavigate?.('montaje')}>
              Probarlo en el montaje virtual →
            </button>
          )}
          {t.id === 'capacitancia' && (
            <button type="button" className="contenido-accion" onClick={() => onNavigate?.('ejercicios')}>
              Ver los ejercicios de capacitancia →
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

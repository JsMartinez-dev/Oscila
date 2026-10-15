// Aplicaciones de Electricidad y Magnetismo en ingeniería.

import { useState } from 'react';
import Markdown from '../components/Markdown.jsx';
import { APLICACIONES } from '../contenido/aplicaciones.js';
import { abrirEnMontaje } from '../circuitos/pendiente.js';
import './Contenido.css';

export default function Aplicaciones({ onNavigate }) {
  const [abierta, setAbierta] = useState(APLICACIONES[0].id);
  const ap = APLICACIONES.find((a) => a.id === abierta);
  return (
    <div className="contenido">
      <header className="contenido-cabecera">
        <h1>Aplicaciones en ingeniería</h1>
        <p>Dónde aparecen el potencial, los condensadores y los circuitos en problemas reales de distintas ingenierías.</p>
      </header>
      <div className="contenido-indice">
        {APLICACIONES.map((a, i) => (
          <button key={a.id} type="button" className={abierta === a.id ? 'activa' : ''} onClick={() => setAbierta(a.id)}>
            <span className="contenido-num">{i + 1}</span>
            <span>
              <strong>{a.titulo}</strong>
              <small>{a.resumen}</small>
            </span>
          </button>
        ))}
      </div>
      <article className="hoja contenido-hoja" key={ap.id}>
        <h2>{ap.titulo}</h2>
        {ap.revisar && <p className="contenido-revisar">Contenido nuevo: pendiente de revisión por el equipo.</p>}
        {ap.imagenes && (
          <div className="contenido-galeria">
            {ap.imagenes.map((im) => (
              <figure key={im.src}>
                <img src={`${import.meta.env.BASE_URL}${im.src}`} alt={im.pie} loading="lazy" />
                <figcaption>{im.pie}</figcaption>
              </figure>
            ))}
          </div>
        )}
        <Markdown>{ap.md}</Markdown>
        {ap.circuito && (
          <button
            type="button"
            className="contenido-accion"
            onClick={() => {
              abrirEnMontaje(structuredClone(ap.circuito));
              onNavigate?.('montaje');
            }}
          >
            Abrir este circuito en el montaje →
          </button>
        )}
      </article>
    </div>
  );
}

import { useState } from 'react';
import BannerRevision from './BannerRevision.jsx';
import '../Contenido.css';
import './CalorOndas.css';

export default function PaginaTemas({ titulo, subtitulo, secciones, render, clase = '' }) {
  const [abierta, setAbierta] = useState(secciones[0].id);
  const actual = secciones.find((s) => s.id === abierta);
  return (
    <div className={`contenido co ${clase}`}>
      <BannerRevision />
      <header className="contenido-cabecera">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </header>
      <div className="contenido-indice">
        {secciones.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={abierta === s.id ? 'activa' : ''}
            aria-current={abierta === s.id ? 'true' : undefined}
            onClick={() => setAbierta(s.id)}
          >
            <span className="contenido-num">{i + 1}</span>
            <span>
              <strong>{s.title}</strong>
              <small>{s.desc}</small>
            </span>
          </button>
        ))}
      </div>
      <article className="hoja contenido-hoja co-hoja" key={actual.id}>
        {render(actual)}
      </article>
    </div>
  );
}

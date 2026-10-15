// Render de la solución paso a paso generada por src/circuitos/pasos.js.

import { Esquema } from '../circuitos/Esquema.jsx';
import { TexBloque, TexLinea, TextoMat } from './Tex.jsx';

export default function Pasos({ bloques }) {
  const diagramas = bloques.filter((b) => b.tipo === 'diagrama');
  const resto = bloques.filter((b) => b.tipo !== 'diagrama');
  return (
    <div className="pasos">
      {diagramas.length > 0 && (
        <section className="pasos-diagramas">
          <h3 className="pasos-h">1. Diagrama{diagramas.length > 1 ? 's' : ''}</h3>
          <div className="pasos-diagramas-grid">
            {diagramas.map((d, i) => (
              <figure key={i} className="pasos-figura">
                <figcaption>
                  <strong>{d.titulo}</strong>
                  {d.subtitulo && (
                    <span className="pasos-sub">
                      {' '}
                      (<TextoMat texto={d.subtitulo} />)
                    </span>
                  )}
                </figcaption>
                {d.doc ? <Esquema doc={d.doc} anotaciones={d.anotaciones} maxAncho={520} /> : <p className="pasos-nota">Sin dibujo disponible.</p>}
              </figure>
            ))}
          </div>
        </section>
      )}
      {resto.map((b, i) => (
        <Bloque key={i} b={b} />
      ))}
    </div>
  );
}

function Bloque({ b }) {
  switch (b.tipo) {
    case 'titulo':
      return <h3 className="pasos-h">{b.texto}</h3>;
    case 'texto':
      return (
        <p className="pasos-texto">
          <TextoMat texto={b.texto} />
        </p>
      );
    case 'formulas':
      return (
        <blockquote className="pasos-formulas">
          <strong>Fórmulas:</strong>{' '}
          {b.latex.map((l, i) => (
            <span key={i} className="pasos-formula">
              <TexLinea latex={l} />
              {i < b.latex.length - 1 && <span className="pasos-sep"> ; </span>}
            </span>
          ))}
        </blockquote>
      );
    case 'ecuacion':
      return <TexBloque latex={b.latex} tag={b.tag} />;
    case 'tabla':
      return (
        <div className="pasos-tabla-wrap">
          <table className="pasos-tabla">
            <thead>
              <tr>
                {b.encabezados.map((h, i) => (
                  <th key={i}>
                    <TextoMat texto={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.filas.map((f, i) => (
                <tr key={i}>
                  {f.map((c, j) => (
                    <td key={j}>
                      <TextoMat texto={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'check':
      return (
        <p className="pasos-check">
          <TextoMat texto={b.texto} />
        </p>
      );
    case 'resumen':
      return (
        <section className="pasos-resumen">
          <h3 className="pasos-h">Resumen de respuestas</h3>
          <ul>
            {b.items.map((it, i) => (
              <li key={i}>
                <TexLinea latex={it} />
              </li>
            ))}
          </ul>
        </section>
      );
    default:
      return null;
  }
}

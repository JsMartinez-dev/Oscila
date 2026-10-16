// Render de la solución paso a paso generada por src/circuitos/pasos.js.

import { useLayoutEffect, useRef, useState } from 'react';
import { Esquema } from '../circuitos/Esquema.jsx';
import { TexBloque, TexLinea, TextoMat } from './Tex.jsx';

// Todos los diagramas de una solución van a la misma escala (mismos píxeles por unidad de cuadrícula).
// El tamaño natural de cada dibujo es su viewBox (1 px por unidad, es decir G px por cuadro de la cuadrícula).
const ESCALA_MAX = 1.5; // tope respecto al tamaño natural
const ALTO_MAX = 420; // px: ningún diagrama más alto que esto

/**
 * Mide el viewBox de cada diagrama y calcula un solo factor para el grupo: el que hace caber al más grande
 * a lo ancho de la hoja (y a ALTO_MAX de alto), con tope de 1.5×. Los diagramas que con ese factor no caben
 * en media columna ocupan la fila completa. Devuelve, por diagrama, el ancho en px y si va a fila completa.
 */
function useEscalaComun(dependencia) {
  const ref = useRef(null);
  const [disposicion, setDisposicion] = useState([]);

  useLayoutEffect(() => {
    const grilla = ref.current;
    if (!grilla) return undefined;
    const medir = () => {
      const figuras = [...grilla.querySelectorAll(':scope > .pasos-figura')];
      if (!figuras.length) return;
      const cg = getComputedStyle(grilla);
      const columnas = cg.gridTemplateColumns.split(' ').length;
      const hueco = parseFloat(cg.columnGap) || 0;
      const cf = getComputedStyle(figuras[0]);
      const marco = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce((s, k) => s + (parseFloat(cf[k]) || 0), 0);
      const anchoFila = grilla.clientWidth - marco;
      const anchoMitad = columnas > 1 ? (grilla.clientWidth - hueco * (columnas - 1)) / columnas - marco : anchoFila;

      const vb = figuras.map((f) => f.querySelector(':scope > svg')?.viewBox.baseVal ?? null);
      const validos = vb.filter(Boolean);
      if (!validos.length) return;
      const s = Math.min(ESCALA_MAX, ...validos.map((v) => anchoFila / v.width), ...validos.map((v) => ALTO_MAX / v.height));
      const nueva = vb.map((v) => (v ? { ancho: Math.floor(v.width * s * 100) / 100, fila: v.width * s > anchoMitad + 0.5 } : null));
      setDisposicion((prev) =>
        prev.length === nueva.length && prev.every((x, i) => x?.ancho === nueva[i]?.ancho && x?.fila === nueva[i]?.fila) ? prev : nueva,
      );
    };
    medir();
    // El ancho de la hoja cambia con la ventana, la barra lateral y el modo feria (letra más grande)
    const ro = new ResizeObserver(medir);
    ro.observe(grilla);
    return () => ro.disconnect();
  }, [dependencia]);

  return [ref, disposicion];
}

export default function Pasos({ bloques }) {
  const diagramas = bloques.filter((b) => b.tipo === 'diagrama');
  const resto = bloques.filter((b) => b.tipo !== 'diagrama');
  const [refGrilla, disposicion] = useEscalaComun(bloques);
  return (
    <div className="pasos">
      {diagramas.length > 0 && (
        <section className="pasos-diagramas">
          <h3 className="pasos-h">1. Diagrama{diagramas.length > 1 ? 's' : ''}</h3>
          <div className="pasos-diagramas-grid" ref={refGrilla}>
            {diagramas.map((d, i) => (
              <figure
                key={i}
                className={`pasos-figura${i === 0 || disposicion[i]?.fila ? ' pasos-figura--fila' : ''}`}
                style={disposicion[i] ? { '--ancho-dibujo': `${disposicion[i].ancho}px` } : undefined}
              >
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
                {d.doc && d.leyenda && (
                  <p className="pasos-leyenda">
                    <TextoMat texto={d.leyenda} />
                  </p>
                )}
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

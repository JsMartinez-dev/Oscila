// Ejercicios resueltos de Electricidad y Magnetismo, agrupados por sección y con incisos colapsables.

import { useState } from 'react';
import Markdown from '../components/Markdown.jsx';
import { TextoMat } from '../components/Tex.jsx';
import { EJERCICIOS, SECCIONES, figuras } from '../contenido/ejercicios.js';
import { IMAGENES_EYM } from '../contenido/creditos.js';
import './Ejercicios.css';

export default function Ejercicios() {
  const [actual, setActual] = useState(EJERCICIOS[0].numero);
  const [abiertos, setAbiertos] = useState({}); // "num-i" → bool
  const ej = EJERCICIOS.find((e) => e.numero === actual);

  const todos = (valor) => {
    const nuevo = { ...abiertos, [`${ej.numero}-pre`]: valor };
    ej.incisos.forEach((_, i) => (nuevo[`${ej.numero}-${i}`] = valor));
    setAbiertos(nuevo);
  };
  const abierto = (k) => abiertos[k] ?? false;
  const alternar = (k) => setAbiertos((a) => ({ ...a, [k]: !(a[k] ?? false) }));

  const idx = EJERCICIOS.indexOf(ej);
  const ir = (d) => {
    const sig = EJERCICIOS[idx + d];
    if (sig) {
      setActual(sig.numero);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="ejer">
      <header className="ejer-cabecera">
        <h1>Ejercicios resueltos</h1>
        <p>Potencial, capacitancia, circuitos y leyes de Kirchhoff, con la solución paso a paso. Abre cada inciso cuando quieras ver cómo se resuelve.</p>
      </header>

      <div className="ejer-cuerpo">
        <nav className="ejer-indice" aria-label="Índice de ejercicios">
          {SECCIONES.map((s, i) => (
            <section key={s}>
              <h2>
                {i + 1}. {s}
              </h2>
              <ul>
                {EJERCICIOS.filter((e) => e.seccion === s).map((e) => (
                  <li key={e.numero}>
                    <button
                      type="button"
                      className={e.numero === actual ? 'activo' : ''}
                      aria-current={e.numero === actual ? 'true' : undefined}
                      onClick={() => setActual(e.numero)}
                    >
                      Ejercicio {e.numero}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <article className="hoja ejer-hoja" key={ej.numero}>
          <p className="ejer-seccion">{ej.seccion}</p>
          <h2 className="ejer-titulo">Ejercicio {ej.numero}</h2>

          <section className="ejer-enunciado">
            <h3>Enunciado</h3>
            <Markdown figuras={figuras}>{ej.enunciado}</Markdown>
          </section>

          <div className="ejer-controles">
            <h3>Solución</h3>
            <button type="button" onClick={() => todos(true)}>
              Mostrar todo
            </button>
            <button type="button" onClick={() => todos(false)}>
              Ocultar todo
            </button>
          </div>

          {ej.preambulo && (
            <details className="ejer-inciso" open={abierto(`${ej.numero}-pre`)}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  alternar(`${ej.numero}-pre`);
                }}
              >
                Planteamiento: diagrama y fórmulas
              </summary>
              <div className="ejer-inciso-cuerpo">
                <Markdown figuras={figuras}>{ej.preambulo}</Markdown>
              </div>
            </details>
          )}

          {ej.incisos.map((inc, i) => (
            <details key={i} className="ejer-inciso" open={abierto(`${ej.numero}-${i}`)}>
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  alternar(`${ej.numero}-${i}`);
                }}
              >
                <TextoMat texto={inc.titulo} />
              </summary>
              <div className="ejer-inciso-cuerpo">
                <Markdown figuras={figuras}>{inc.cuerpo}</Markdown>
              </div>
            </details>
          ))}

          <div className="ejer-navegar">
            <button type="button" onClick={() => ir(-1)} disabled={idx === 0}>
              ← Anterior
            </button>
            <button type="button" onClick={() => ir(1)} disabled={idx === EJERCICIOS.length - 1}>
              Siguiente →
            </button>
          </div>
        </article>
      </div>
      <p className="ejer-credito">{IMAGENES_EYM.find((g) => g.carpeta).credito}</p>
    </div>
  );
}

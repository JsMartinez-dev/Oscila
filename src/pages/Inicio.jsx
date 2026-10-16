// Portada de la plataforma: los tres módulos (Electricidad y Magnetismo es el principal) y los créditos.

import { EJERCICIOS } from '../contenido/ejercicios.js';
import { PREGUNTAS } from '../contenido/test.js';
import { TEORIA } from '../contenido/teoria.js';
import { APLICACIONES } from '../contenido/aplicaciones.js';
import { ETIQUETA_ESTADO, modulosVisibles } from '../contenido/modulos.js';
import { EYM, PLATAFORMA } from '../contenido/creditos.js';
import { CREDITOS_CALOR_ONDAS as CO } from '../contenido/calor-ondas/creditos.js';
import './Inicio.css';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// Accesos del módulo principal; las cantidades salen de los datos
const ACCESOS = [
  { id: 'teoria', titulo: 'Teoría', texto: 'Potencial, capacitancia, circuitos y leyes de Kirchhoff.', cantidad: plural(TEORIA.length, 'tema', 'temas') },
  { id: 'ejercicios', titulo: 'Ejercicios', texto: 'Resueltos paso a paso, con incisos colapsables.', cantidad: plural(EJERCICIOS.length, 'ejercicio', 'ejercicios') },
  { id: 'ejemplos', titulo: 'Aplicaciones', texto: 'Electricidad y magnetismo en la ingeniería.', cantidad: plural(APLICACIONES.length, 'aplicación', 'aplicaciones') },
  { id: 'test', titulo: 'Test', texto: 'Retroalimentación y plan de estudio en PDF.', cantidad: plural(PREGUNTAS.length, 'pregunta', 'preguntas') },
];

export default function Inicio({ onNavigate, feria = false }) {
  const modulos = modulosVisibles(feria);
  return (
    <div className="inicio">
      <header className="inicio-hero">
        <h1 className="inicio-titulo">{PLATAFORMA.nombre}</h1>
        <p className="inicio-lema">{PLATAFORMA.lema}</p>
        <p className="inicio-evento">
          {EYM.evento} · {EYM.universidad}
        </p>
      </header>

      <section aria-labelledby="inicio-modulos">
        <h2 id="inicio-modulos" className="inicio-seccion">
          Módulos
        </h2>
        <div className="inicio-modulos">
          {modulos.map((m) =>
            m.estado === 'activo' ? (
              <article key={m.id} className="tarjeta modulo modulo--principal" aria-labelledby={`modulo-${m.id}`}>
                <div className="modulo-cabecera">
                  <h3 id={`modulo-${m.id}`}>{m.nombre}</h3>
                  <span className="pildora pildora--acento">Disponible</span>
                </div>
                <p className="modulo-texto">{m.descripcion}</p>
                <button type="button" className="btn btn--acento modulo-cta" onClick={() => onNavigate?.('montaje')}>
                  Abrir el montaje virtual
                  <span aria-hidden="true">→</span>
                </button>
                <ul className="modulo-accesos">
                  {ACCESOS.map((a) => (
                    <li key={a.id}>
                      <button type="button" className="modulo-acceso" onClick={() => onNavigate?.(a.id)}>
                        <span className="modulo-acceso-titulo">
                          <span className="modulo-acceso-nombre">{a.titulo}</span>
                          <span className="pildora">{a.cantidad}</span>
                        </span>
                        <span className="modulo-acceso-texto">{a.texto}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </article>
            ) : (
              <article
                key={m.id}
                className={`tarjeta modulo modulo--${m.estado}`}
                aria-labelledby={`modulo-${m.id}`}
                aria-disabled={m.ruta ? undefined : 'true'}
              >
                <div className="modulo-cabecera">
                  <h3 id={`modulo-${m.id}`}>{m.nombre}</h3>
                  <span className={`pildora pildora--${m.estado}`}>{ETIQUETA_ESTADO[m.estado]}</span>
                </div>
                <p className="modulo-texto">{m.descripcion}</p>
                {m.ruta && (
                  <button type="button" className="btn" onClick={() => onNavigate?.(m.ruta)}>
                    Abrir módulo
                  </button>
                )}
              </article>
            ),
          )}
        </div>
      </section>

      <section className="tarjeta inicio-creditos" aria-labelledby="inicio-creditos">
        <h2 id="inicio-creditos" className="inicio-seccion">
          Créditos
        </h2>
        <div className="inicio-creditos-cuerpo">
          <div className="inicio-universidad">
            <img src={`${import.meta.env.BASE_URL}logo-unimagdalena.png`} alt="Escudo de la Universidad del Magdalena" />
            <span>
              {EYM.universidad}
              <small>{EYM.evento}</small>
            </span>
          </div>
          <div className="inicio-personas">
            <div>
              <h3 className="inicio-creditos-titulo">{EYM.modulo}: desarrolladores</h3>
              <ul>
                {EYM.desarrolladores.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="inicio-creditos-titulo">Profesor</h3>
              <ul>
                <li>{EYM.profesor}</li>
              </ul>
            </div>
            {!feria && (
              <div className="inicio-creditos-co">
                <h3 className="inicio-creditos-titulo">Calor y Ondas</h3>
                <p>
                  Módulo original desarrollado por {CO.integrantes.join(', ')}. Profesor: {CO.profesor}.
                </p>
              </div>
            )}
          </div>
        </div>
        <button type="button" className="btn" onClick={() => onNavigate?.('creditos')}>
          Ver todos los créditos
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}

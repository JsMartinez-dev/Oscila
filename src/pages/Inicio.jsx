// Portada de la plataforma: los tres módulos (Electricidad y Magnetismo es el principal) y los créditos.

import { EJERCICIOS } from '../contenido/ejercicios.js';
import { PREGUNTAS } from '../contenido/test.js';
import { TEORIA } from '../contenido/teoria.js';
import { APLICACIONES } from '../contenido/aplicaciones.js';
import { ETIQUETA_ESTADO, modulosVisibles } from '../contenido/modulos.js';
import './Inicio.css';

const DESARROLLADORES = ['Juan Sebastian Martinez', 'Juan David Rivera'];

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
        <p className="inicio-evento">II Foro Internacional de Física · Universidad del Magdalena</p>
        <h1 className="inicio-titulo">Circuitos en Vivo</h1>
        <p className="inicio-lema">
          Dibuja un circuito (o tómale una foto a uno hecho a mano): la plataforma lo clasifica y lo resuelve paso a paso, verificando cada número.
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
                          {a.titulo}
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
                    Ver estado
                  </button>
                )}
              </article>
            ),
          )}
        </div>
      </section>

      <section className="tarjeta inicio-creditos" aria-label="Créditos">
        <div className="inicio-universidad">
          <img src={`${import.meta.env.BASE_URL}logo-unimagdalena.png`} alt="Escudo de la Universidad del Magdalena" />
          <span>Universidad del Magdalena</span>
        </div>
        <div className="inicio-personas">
          <div>
            <h2 className="inicio-creditos-titulo">Desarrolladores</h2>
            <ul>
              {DESARROLLADORES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="inicio-creditos-titulo">Profesor</h2>
            <ul>
              <li>Jarvin Mestra Páez</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

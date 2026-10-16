import { EYM, IMAGENES_EYM, INSPIRACION, PLATAFORMA, TECNOLOGIAS } from '../contenido/creditos.js';
import { CREDITOS_CALOR_ONDAS as CO } from '../contenido/calor-ondas/creditos.js';
import { IMAGENES } from '../contenido/calor-ondas/imagenes.js';
import { Credito } from './calor-ondas/Figura.jsx';
import './Contenido.css';
import './Creditos.css';

const Enlace = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const imagenesCO = Object.entries(IMAGENES).filter(([, im]) => !im.src.startsWith('aplicaciones/'));
const nombreCO = (id, im) => (id.startsWith('ejercicio-') ? `Boceto del ejercicio ${id.slice(-1)}` : im.alt);

export default function Creditos({ feria = false }) {
  const commons = imagenesCO.filter(([, im]) => im.credito.tipo === 'commons');
  const equipo = imagenesCO.filter(([, im]) => im.credito.tipo === 'equipo');
  const propias = imagenesCO.filter(([, im]) => im.credito.tipo === 'propia');

  return (
    <div className="contenido creditos">
      <header className="contenido-cabecera">
        <h1>Créditos</h1>
        <p>
          {PLATAFORMA.nombre}: {PLATAFORMA.lema.toLowerCase()}. Quiénes la hicieron, en qué se inspiró, con qué está construida y de dónde salen sus imágenes.
        </p>
      </header>

      <section className="tarjeta creditos-bloque" aria-labelledby="cr-eym">
        <h2 id="cr-eym">{EYM.modulo}</h2>
        <dl className="creditos-datos">
          <div>
            <dt>Desarrolladores</dt>
            <dd>
              <ul>
                {EYM.desarrolladores.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Profesor</dt>
            <dd>{EYM.profesor}</dd>
          </div>
          <div>
            <dt>Universidad</dt>
            <dd>{EYM.universidad}</dd>
          </div>
          <div>
            <dt>Evento</dt>
            <dd>{EYM.evento}</dd>
          </div>
        </dl>
      </section>

      {!feria && (
        <section className="tarjeta creditos-bloque" aria-labelledby="cr-co">
          <h2 id="cr-co">Calor y Ondas</h2>
          <p>Módulo original desarrollado por:</p>
          <ul className="creditos-columnas">
            {CO.integrantes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p>
            <strong>Profesor:</strong> {CO.profesor}. <strong>Desarrollo de la plataforma original:</strong> {CO.desarrollador.nombre}.
          </p>
        </section>
      )}

      <section className="tarjeta creditos-bloque" aria-labelledby="cr-inspiracion">
        <h2 id="cr-inspiracion">Inspiración</h2>
        <p>
          {INSPIRACION.texto} <Enlace href={INSPIRACION.enlace}>{INSPIRACION.enlace}</Enlace>
        </p>
      </section>

      <section className="tarjeta creditos-bloque" aria-labelledby="cr-tecnologias">
        <h2 id="cr-tecnologias">Tecnologías y licencias</h2>
        <ul className="creditos-lista">
          {TECNOLOGIAS.map((t) => (
            <li key={t.nombre}>
              <strong>{t.url ? <Enlace href={t.url}>{t.nombre}</Enlace> : t.nombre}</strong> · {t.uso} · Licencia:{' '}
              <Enlace href={t.licenciaUrl}>{t.licencia}</Enlace>
            </li>
          ))}
        </ul>
      </section>

      <section className="tarjeta creditos-bloque" aria-labelledby="cr-imagenes">
        <h2 id="cr-imagenes">Imágenes y multimedia</h2>

        <h3>{EYM.modulo}</h3>
        <ul className="creditos-lista">
          {IMAGENES_EYM.map((g) => (
            <li key={g.titulo}>
              <strong>{g.titulo}:</strong> {g.credito}
            </li>
          ))}
        </ul>

        {!feria && (
          <>
            <h3>Calor y Ondas · Wikimedia Commons</h3>
            <ul className="creditos-lista">
              {commons.map(([id, im]) => (
                <li key={id}>
                  <Credito credito={im.credito} />
                </li>
              ))}
            </ul>

            <h3>Calor y Ondas · Equipo de Calor y Ondas</h3>
            <ul className="creditos-lista">
              {equipo.map(([id, im]) => (
                <li key={id}>
                  {nombreCO(id, im)}
                  {im.credito.nota ? ` (${im.credito.nota})` : ''}
                </li>
              ))}
            </ul>

            <h3>Calor y Ondas · Dibujos propios de {PLATAFORMA.nombre}</h3>
            <p>
              {propias.length} ilustraciones en SVG de Teoría y Aplicaciones, que reemplazan imágenes sin licencia verificable de la versión anterior.
              {propias
                .filter(([, im]) => im.credito.nota)
                .map(([, im]) => ` ${im.alt.split(' (')[0]}: ${im.credito.nota}.`)}
            </p>
          </>
        )}
      </section>
    </div>
  );
}

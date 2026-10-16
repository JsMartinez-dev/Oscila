// Calor y Ondas: módulo en revisión. Su contenido se restaura en la Tarea 5; aquí solo la ruta.

import { MODULOS, ETIQUETA_ESTADO } from '../contenido/modulos.js';

const MODULO = MODULOS.find((m) => m.id === 'calor-ondas');

export default function CalorOndas({ onNavigate }) {
  return (
    <div className="pagina-estado">
      <header className="pagina-estado-cabecera">
        <h1>{MODULO.nombre}</h1>
        <span className="pildora pildora--revision">{ETIQUETA_ESTADO[MODULO.estado]}</span>
      </header>
      <section className="tarjeta pagina-estado-cuerpo">
        <p>{MODULO.descripcion}</p>
        <p>Mientras tanto, este módulo no se muestra en el modo feria.</p>
        <button type="button" className="btn btn--principal" onClick={() => onNavigate?.('inicio')}>
          Volver al inicio
        </button>
      </section>
    </div>
  );
}

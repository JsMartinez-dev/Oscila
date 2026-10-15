// Montaje virtual de circuitos: editor, reconocimiento de foto y solución paso a paso.

import { useMemo, useState } from 'react';
import Editor, { centrar } from '../components/editor/Editor.jsx';
import { DOC_VACIO, useHistorial } from '../components/editor/useHistorial.js';
import Pasos from '../components/Pasos.jsx';
import { TextoMat } from '../components/Tex.jsx';
import { docANetlist, validarNetlist } from '../circuitos/netlist.js';
import { resolverPasoAPaso } from '../circuitos/pasos.js';
import ReconocerFoto from '../components/foto/ReconocerFoto.jsx';
import './Montaje.css';

const PESTANAS = [
  { id: 'editor', nombre: '1. Dibujar' },
  { id: 'foto', nombre: '2. Desde una foto' },
  { id: 'solucion', nombre: '3. Solución' },
];

const ETIQUETA_CLASE = {
  serie: 'Serie',
  paralelo: 'Paralelo',
  mixto: 'Mixto',
};

export default function Montaje() {
  const historial = useHistorial(DOC_VACIO);
  const [pestana, setPestana] = useState('editor');
  const [entrada, setEntrada] = useState(null); // { doc, metodo }
  const [avisoFoto, setAvisoFoto] = useState(null);

  const resultado = useMemo(() => {
    if (!entrada) return null;
    const { netlist, geo, avisos } = docANetlist(entrada.doc);
    const val = validarNetlist(netlist);
    if (!val.ok) return { ok: false, error: val.errores.join(' '), avisos: [...avisos, ...val.avisos] };
    const r = resolverPasoAPaso(netlist, { doc: entrada.doc, geo, metodo: entrada.metodo });
    return { ...r, avisos: [...avisos, ...(r.avisos ?? [])], netlist };
  }, [entrada]);

  const calcular = (doc) => {
    if (doc.componentes.some((c) => c.revisar)) {
      const seguir = window.confirm('Hay elementos marcados para revisar (en amarillo). ¿Ya los revisaste y quieres calcular de todos modos?');
      if (!seguir) return;
    }
    setEntrada({ doc, metodo: null });
    setPestana('solucion');
  };

  const cargarDesdeFoto = (doc) => {
    historial.cambiar(centrar(doc));
    setAvisoFoto(
      <div className="montaje-banner">
        <strong>Revisa y corrige antes de calcular.</strong> El circuito viene de una foto: compara cada valor, la polaridad de las fuentes y las conexiones con
        el dibujo original. Lo resaltado en amarillo es lo que el reconocimiento leyó con menos seguridad.
        <button type="button" onClick={() => setAvisoFoto(null)} aria-label="Cerrar aviso">
          ✕
        </button>
      </div>,
    );
    setPestana('editor');
  };

  return (
    <div className="montaje">
      <header className="montaje-cabecera">
        <h1>Montaje virtual de circuitos</h1>
        <p>Dibuja un circuito (o tómale una foto a uno hecho a mano), y la plataforma lo clasifica y lo resuelve paso a paso.</p>
      </header>

      <nav className="montaje-pestanas" role="tablist">
        {PESTANAS.map((p) => (
          <button key={p.id} role="tab" aria-selected={pestana === p.id} className={pestana === p.id ? 'activa' : ''} onClick={() => setPestana(p.id)}>
            {p.nombre}
          </button>
        ))}
      </nav>

      <div hidden={pestana !== 'editor'}>
        <Editor historial={historial} onCalcular={calcular} avisoArriba={avisoFoto} />
      </div>
      {pestana === 'foto' && <ReconocerFoto onCargar={cargarDesdeFoto} />}
      {pestana === 'solucion' && (
        <Solucion
          resultado={resultado}
          entrada={entrada}
          cambiarMetodo={(metodo) => setEntrada((e) => ({ ...e, metodo }))}
          volver={() => setPestana('editor')}
        />
      )}
    </div>
  );
}

function Solucion({ resultado, entrada, cambiarMetodo, volver }) {
  if (!resultado) {
    return (
      <div className="montaje-vacio">
        <p>Todavía no hay nada que resolver. Dibuja un circuito y pulsa <strong>Calcular</strong>.</p>
        <button type="button" onClick={volver}>
          Ir al editor
        </button>
      </div>
    );
  }
  const clas = resultado.clasificacion;
  const reducible = clas?.metodo === 'reduccion';
  return (
    <div className="montaje-solucion">
      {resultado.avisos?.length > 0 && (
        <ul className="montaje-avisos">
          {resultado.avisos.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}

      {clas && (
        <section className={`montaje-clase clase-${clas.clasificacion.split(' ')[0]}`}>
          <div className="montaje-clase-tipo">
            <span>Clasificación</span>
            <strong>{ETIQUETA_CLASE[clas.clasificacion] ?? clas.clasificacion[0].toUpperCase() + clas.clasificacion.slice(1)}</strong>
          </div>
          <p>
            <TextoMat texto={clas.explicacion} />
          </p>
        </section>
      )}

      {clas?.metodo && (
        <div className="montaje-metodo" role="radiogroup" aria-label="Método de solución">
          <span>Método:</span>
          <button type="button" className={resultado.metodo === 'reduccion' ? 'activa' : ''} disabled={!reducible} onClick={() => cambiarMetodo('reduccion')} title={reducible ? '' : 'Este circuito no se reduce por serie/paralelo'}>
            Por reducción
          </button>
          <button type="button" className={resultado.metodo === 'kirchhoff' ? 'activa' : ''} onClick={() => cambiarMetodo('kirchhoff')} disabled={!resultado.netlist?.elementos.some((e) => e.tipo === 'resistencia')}>
            Por leyes de Kirchhoff
          </button>
          {reducible && <span className="montaje-mini">(Kirchhoff es opcional en circuitos reducibles)</span>}
        </div>
      )}

      {!resultado.ok ? (
        <div className="montaje-error">
          <strong>No se puede mostrar la solución.</strong>
          <p>{resultado.error}</p>
          {resultado.fallas?.length > 0 && (
            <details>
              <summary>Detalle de la verificación</summary>
              <ul>
                {resultado.fallas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </details>
          )}
          <button type="button" onClick={volver}>
            Volver al editor
          </button>
        </div>
      ) : (
        <article className="hoja">
          <Pasos bloques={resultado.bloques} />
          <p className="hoja-verificado">✓ Todos los valores de esta solución se verificaron con un análisis nodal independiente (tolerancia 1 %).</p>
        </article>
      )}
    </div>
  );
}

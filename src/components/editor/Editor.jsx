// Editor de circuitos en cuadrícula, al estilo de circuit-diagram.org.
// Herramientas: seleccionar/mover, cable, fuente, resistencia, condensador, nodo, etiqueta y borrar.
// Teclas: R rota, Supr borra, Ctrl+Z deshace, Ctrl+Y (o Ctrl+Shift+Z) rehace, Esc vuelve a seleccionar.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CapaEsquema, Esquema, G, limites } from '../../circuitos/Esquema.jsx';
import { LARGO, terminales } from '../../circuitos/geometria.js';
import { parsearValor, formatearValor, UNIDAD } from '../../circuitos/unidades.js';
import { EJEMPLOS } from '../../circuitos/ejemplos.js';
import { exportarPNG, exportarSVG } from './exportar.js';
import { DOC_VACIO } from './useHistorial.js';
import './Editor.css';

const ANCHO = 44; // unidades de cuadrícula
const ALTO = 26;
const UMBRAL_CONFIANZA = 0.7;

const HERRAMIENTAS = [
  { id: 'seleccionar', nombre: 'Seleccionar', icono: '↖', ayuda: 'Selecciona y arrastra elementos' },
  { id: 'cable', nombre: 'Cable', icono: '╱', ayuda: 'Arrastra de un punto a otro (o clic y clic)' },
  { id: 'fuente', nombre: 'Fuente DC', icono: '⊣⊢', ayuda: 'Fuente de voltaje con + y −' },
  { id: 'resistencia', nombre: 'Resistencia', icono: '⏛', ayuda: 'Resistencia' },
  { id: 'condensador', nombre: 'Condensador', icono: '⊣⊢', ayuda: 'Condensador' },
  { id: 'nodo', nombre: 'Nodo', icono: '●', ayuda: 'Une cables que se cruzan' },
  { id: 'etiqueta', nombre: 'Etiqueta', icono: 'a', ayuda: 'Nombre de un punto (a, b, c…)' },
  { id: 'borrar', nombre: 'Borrar', icono: '✕', ayuda: 'Clic sobre lo que quieras borrar' },
];

const PREFIJO_ID = { fuente: 'E', resistencia: 'R', condensador: 'C' };
const VALOR_INICIAL = { fuente: 12, resistencia: 100, condensador: 10e-6 };
const ROT_INICIAL = { fuente: 270, resistencia: 0, condensador: 0 };
const DIR = { 0: [1, 0], 90: [0, 1], 180: [-1, 0], 270: [0, -1] };

const esComponente = (h) => h === 'fuente' || h === 'resistencia' || h === 'condensador';

function siguienteId(doc, prefijo) {
  let max = 0;
  for (const c of doc.componentes) {
    const m = c.id.match(new RegExp(`^${prefijo}(\\d+)$`));
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefijo}${max + 1}`;
}

let contadorCable = 0;
const idNuevo = (p) => `${p}${Date.now().toString(36)}${(contadorCable++).toString(36)}`;

function siguienteLetra(doc) {
  const usadas = new Set(doc.etiquetas.map((e) => e.texto));
  for (const l of 'abcdefghijklmnopqrstuvwxyz') if (!usadas.has(l)) return l;
  return `p${doc.etiquetas.length + 1}`;
}

function distSeg(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** ¿Qué hay bajo el puntero? (coordenadas en unidades de cuadrícula, sin redondear) */
function elementoEn(doc, p) {
  for (const e of doc.etiquetas) if (Math.hypot(p.x - e.x, p.y - e.y) < 0.6) return { clase: 'etiqueta', id: e.id };
  for (const n of doc.nodos) if (Math.hypot(p.x - n.x, p.y - n.y) < 0.45) return { clase: 'nodo', id: n.id };
  let mejor = null;
  for (const c of doc.componentes) {
    const t = terminales(c);
    const d = distSeg(p, t.a, t.b);
    if (d < 0.75 && (!mejor || d < mejor.d)) mejor = { clase: 'componente', id: c.id, d };
  }
  if (mejor) return mejor;
  for (const w of doc.cables) {
    const d = distSeg(p, { x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 });
    if (d < 0.4 && (!mejor || d < mejor.d)) mejor = { clase: 'cable', id: w.id, d };
  }
  return mejor;
}

/** Mueve el dibujo para que quede centrado en el lienzo. */
export function centrar(doc) {
  const b = limites(doc);
  const dx = Math.round((ANCHO - (b.x1 - b.x0)) / 2) - b.x0;
  const dy = Math.max(2, Math.round((ALTO - (b.y1 - b.y0)) / 2)) - b.y0;
  return {
    ...doc, // conserva campos extra, como `curso` en los ejemplos
    componentes: (doc.componentes ?? []).map((c) => ({ ...c, x: c.x + dx, y: c.y + dy })),
    cables: (doc.cables ?? []).map((w) => ({ ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy })),
    nodos: (doc.nodos ?? []).map((n) => ({ ...n, x: n.x + dx, y: n.y + dy })),
    etiquetas: (doc.etiquetas ?? []).map((e) => ({ ...e, x: e.x + dx, y: e.y + dy })),
  };
}

function rotar(c) {
  const [dx, dy] = DIR[c.rot];
  const cx = c.x + (dx * LARGO) / 2;
  const cy = c.y + (dy * LARGO) / 2;
  const rot = (c.rot + 90) % 360;
  const [ndx, ndy] = DIR[rot];
  return { ...c, rot, x: cx - (ndx * LARGO) / 2, y: cy - (ndy * LARGO) / 2, revisar: false };
}

/** Cable ortogonal en L: primero horizontal y luego vertical. */
function tramosL(a, b) {
  const tramos = [];
  if (a.x !== b.x) tramos.push({ x1: a.x, y1: a.y, x2: b.x, y2: a.y });
  if (a.y !== b.y) tramos.push({ x1: b.x, y1: a.y, x2: b.x, y2: b.y });
  return tramos;
}

export default function Editor({ historial, onCalcular, avisoArriba = null }) {
  const { doc, cambiar, temporal, confirmar, deshacer, rehacer, puedeDeshacer, puedeRehacer } = historial;
  const [herramienta, setHerramienta] = useState('seleccionar');
  const [rotFantasma, setRotFantasma] = useState(0);
  const [seleccion, setSeleccion] = useState(null); // { clase, id }
  const [cursor, setCursor] = useState(null);
  const [cableInicio, setCableInicio] = useState(null);
  const [mensajeExport, setMensajeExport] = useState('');
  const svgRef = useRef(null);
  const exportRef = useRef(null);
  const arrastre = useRef(null);

  const resaltados = useMemo(() => new Set(doc.componentes.filter((c) => c.revisar).map((c) => c.id)), [doc]);
  const porRevisar = useMemo(
    () =>
      doc.componentes
        .filter((c) => c.revisar)
        .map((c) => ({ c, min: Math.min(c.confianza ?? 1, c.confianza_valor ?? 1, c.tipo === 'fuente' ? c.confianza_polaridad ?? 1 : 1) }))
        .sort((a, b) => a.min - b.min),
    [doc],
  );

  const elegirHerramienta = (h) => {
    setHerramienta(h);
    setCableInicio(null);
    if (esComponente(h)) setRotFantasma(ROT_INICIAL[h]);
  };

  const punto = useCallback((ev) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x / G, y: p.y / G };
  }, []);
  const ajustar = (p) => ({ x: Math.max(0, Math.min(ANCHO, Math.round(p.x))), y: Math.max(0, Math.min(ALTO, Math.round(p.y))) });

  const borrar = useCallback(
    (sel) => {
      if (!sel) return;
      const clave = { componente: 'componentes', cable: 'cables', nodo: 'nodos', etiqueta: 'etiquetas' }[sel.clase];
      cambiar({ ...doc, [clave]: doc[clave].filter((x) => x.id !== sel.id) });
      setSeleccion(null);
    },
    [doc, cambiar],
  );

  const rotarSeleccion = useCallback(() => {
    if (esComponente(herramienta)) {
      setRotFantasma((r) => (r + 90) % 360);
      return;
    }
    if (seleccion?.clase !== 'componente') return;
    cambiar({ ...doc, componentes: doc.componentes.map((c) => (c.id === seleccion.id ? rotar(c) : c)) });
  }, [doc, cambiar, seleccion, herramienta]);

  // Teclado
  useEffect(() => {
    const tecla = (ev) => {
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const ctrl = ev.ctrlKey || ev.metaKey;
      if (ctrl && ev.key.toLowerCase() === 'z' && !ev.shiftKey) {
        ev.preventDefault();
        deshacer();
      } else if (ctrl && (ev.key.toLowerCase() === 'y' || (ev.key.toLowerCase() === 'z' && ev.shiftKey))) {
        ev.preventDefault();
        rehacer();
      } else if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (seleccion) {
          ev.preventDefault();
          borrar(seleccion);
        }
      } else if (ev.key === 'r' || ev.key === 'R') {
        if (!ctrl) rotarSeleccion();
      } else if (ev.key === 'Escape') {
        setHerramienta('seleccionar');
        setCableInicio(null);
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [deshacer, rehacer, borrar, seleccion, rotarSeleccion]);

  const terminarCable = (fin) => {
    const tramos = tramosL(cableInicio, fin).map((t) => ({ id: idNuevo('w'), ...t }));
    if (tramos.length) cambiar({ ...doc, cables: [...doc.cables, ...tramos] });
    setCableInicio(null);
  };

  const alPresionar = (ev) => {
    if (ev.button !== 0) return;
    const p = punto(ev);
    const s = ajustar(p);
    if (herramienta === 'cable') {
      if (cableInicio) terminarCable(s);
      else setCableInicio(s);
      svgRef.current.setPointerCapture?.(ev.pointerId);
      return;
    }
    if (esComponente(herramienta)) {
      const id = siguienteId(doc, PREFIJO_ID[herramienta]);
      const c = { id, tipo: herramienta, x: s.x, y: s.y, rot: rotFantasma, valor: VALOR_INICIAL[herramienta], texto: formatearValor(VALOR_INICIAL[herramienta], herramienta) };
      cambiar({ ...doc, componentes: [...doc.componentes, c] });
      setSeleccion({ clase: 'componente', id });
      return;
    }
    if (herramienta === 'nodo') {
      cambiar({ ...doc, nodos: [...doc.nodos, { id: idNuevo('n'), x: s.x, y: s.y }] });
      return;
    }
    if (herramienta === 'etiqueta') {
      const id = idNuevo('e');
      cambiar({ ...doc, etiquetas: [...doc.etiquetas, { id, x: s.x, y: s.y, texto: siguienteLetra(doc) }] });
      setSeleccion({ clase: 'etiqueta', id });
      return;
    }
    const bajo = elementoEn(doc, p);
    if (herramienta === 'borrar') {
      if (bajo) borrar(bajo);
      return;
    }
    // seleccionar / mover
    setSeleccion(bajo ? { clase: bajo.clase, id: bajo.id } : null);
    if (bajo) {
      arrastre.current = { base: doc, inicio: s, sel: bajo, movido: false };
      svgRef.current.setPointerCapture?.(ev.pointerId);
    }
  };

  const alMover = (ev) => {
    const p = punto(ev);
    const s = ajustar(p);
    setCursor(s);
    const a = arrastre.current;
    if (!a) return;
    const dx = s.x - a.inicio.x;
    const dy = s.y - a.inicio.y;
    if (!dx && !dy && !a.movido) return;
    a.movido = true;
    const b = a.base;
    const mover = (lista, f) => lista.map((x) => (x.id === a.sel.id ? f(x) : x));
    let nuevo = b;
    if (a.sel.clase === 'componente') nuevo = { ...b, componentes: mover(b.componentes, (c) => ({ ...c, x: c.x + dx, y: c.y + dy, revisar: false })) };
    else if (a.sel.clase === 'cable') nuevo = { ...b, cables: mover(b.cables, (w) => ({ ...w, x1: w.x1 + dx, y1: w.y1 + dy, x2: w.x2 + dx, y2: w.y2 + dy })) };
    else if (a.sel.clase === 'nodo') nuevo = { ...b, nodos: mover(b.nodos, (n) => ({ ...n, x: n.x + dx, y: n.y + dy })) };
    else if (a.sel.clase === 'etiqueta') nuevo = { ...b, etiquetas: mover(b.etiquetas, (e) => ({ ...e, x: e.x + dx, y: e.y + dy })) };
    temporal(nuevo);
  };

  const alSoltar = (ev) => {
    if (herramienta === 'cable' && cableInicio) {
      const s = ajustar(punto(ev));
      if (s.x !== cableInicio.x || s.y !== cableInicio.y) terminarCable(s);
      // si no se movió, queda esperando el segundo clic
      return;
    }
    const a = arrastre.current;
    arrastre.current = null;
    if (a?.movido) confirmar(a.base);
  };

  const sel = seleccion && doc[{ componente: 'componentes', cable: 'cables', nodo: 'nodos', etiqueta: 'etiquetas' }[seleccion.clase]]?.find((x) => x.id === seleccion.id);

  const fantasma = esComponente(herramienta) && cursor ? { componentes: [{ id: '__f', tipo: herramienta, x: cursor.x, y: cursor.y, rot: rotFantasma, valor: VALOR_INICIAL[herramienta], nombre: ' ', texto: '' }], cables: [], nodos: [], etiquetas: [] } : null;
  const previaCable = herramienta === 'cable' && cableInicio && cursor ? tramosL(cableInicio, cursor) : [];

  const exportar = async (formato) => {
    setMensajeExport('');
    if (!doc.componentes.length && !doc.cables.length) {
      setMensajeExport('El circuito está vacío.');
      return;
    }
    try {
      if (formato === 'svg') exportarSVG(exportRef.current);
      else await exportarPNG(exportRef.current);
    } catch (e) {
      setMensajeExport(e.message);
    }
  };

  return (
    <div className="editor">
      <div className="editor-barra" role="toolbar" aria-label="Herramientas del editor">
        {HERRAMIENTAS.map((h) => (
          <button
            key={h.id}
            type="button"
            className={`editor-herr ${herramienta === h.id ? 'activa' : ''}`}
            onClick={() => elegirHerramienta(h.id)}
            title={h.ayuda}
            aria-pressed={herramienta === h.id}
          >
            <SimboloBoton tipo={h.id} texto={h.icono} />
            <span>{h.nombre}</span>
          </button>
        ))}
        <span className="editor-sep" />
        <button type="button" className="editor-herr" onClick={rotarSeleccion} title="Rotar 90° (tecla R)">
          <span className="editor-ico">⟳</span>
          <span>Rotar</span>
        </button>
        <button type="button" className="editor-herr" onClick={deshacer} disabled={!puedeDeshacer} title="Deshacer (Ctrl+Z)">
          <span className="editor-ico">↶</span>
          <span>Deshacer</span>
        </button>
        <button type="button" className="editor-herr" onClick={rehacer} disabled={!puedeRehacer} title="Rehacer (Ctrl+Y)">
          <span className="editor-ico">↷</span>
          <span>Rehacer</span>
        </button>
        <span className="editor-sep" />
        <select
          className="editor-select"
          value=""
          onChange={(e) => {
            const ej = EJEMPLOS.find((x) => x.id === e.target.value);
            if (ej) {
              cambiar(centrar(structuredClone(ej.doc)));
              setSeleccion(null);
            }
          }}
          aria-label="Cargar un circuito de ejemplo"
        >
          <option value="">Cargar ejemplo…</option>
          {EJEMPLOS.map((x) => (
            <option key={x.id} value={x.id}>
              {x.titulo}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="editor-herr"
          onClick={() => {
            cambiar(DOC_VACIO);
            setSeleccion(null);
          }}
          title="Borrar todo (se puede deshacer)"
        >
          <span className="editor-ico">🗑</span>
          <span>Limpiar</span>
        </button>
        <button type="button" className="editor-herr" onClick={() => exportar('svg')} title="Descargar como SVG">
          <span className="editor-ico">⤓</span>
          <span>SVG</span>
        </button>
        <button type="button" className="editor-herr" onClick={() => exportar('png')} title="Descargar como PNG">
          <span className="editor-ico">⤓</span>
          <span>PNG</span>
        </button>
      </div>
      {mensajeExport && <p className="editor-aviso">{mensajeExport}</p>}
      {avisoArriba}

      <div className="editor-cuerpo">
        <div className="editor-lienzo-wrap">
          <svg
            ref={svgRef}
            className={`editor-lienzo herr-${herramienta}`}
            viewBox={`0 0 ${ANCHO * G} ${ALTO * G}`}
            onPointerDown={alPresionar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerLeave={() => setCursor(null)}
            role="application"
            aria-label="Lienzo del circuito"
          >
            <defs>
              <pattern id="cuadricula" width={G} height={G} patternUnits="userSpaceOnUse">
                <circle cx={0} cy={0} r={1.1} className="editor-punto" />
              </pattern>
            </defs>
            <rect x={0} y={0} width={ANCHO * G} height={ALTO * G} fill="url(#cuadricula)" />
            <CapaEsquema doc={doc} resaltados={resaltados} seleccion={seleccion?.id} />
            {fantasma && (
              <g opacity={0.45} pointerEvents="none">
                <CapaEsquema doc={fantasma} />
              </g>
            )}
            {previaCable.map((t, i) => (
              <line key={i} x1={t.x1 * G} y1={t.y1 * G} x2={t.x2 * G} y2={t.y2 * G} className="editor-previa" />
            ))}
            {cursor && herramienta !== 'seleccionar' && <circle cx={cursor.x * G} cy={cursor.y * G} r={4} className="editor-cursor" />}
          </svg>
          {!doc.componentes.length && !doc.cables.length && (
            <div className="editor-vacio">
              <p>
                Elige un componente en la barra y haz clic en la cuadrícula para colocarlo. Une los terminales con la herramienta <strong>Cable</strong>.
              </p>
              <p>O usa <strong>Cargar ejemplo…</strong> para empezar con un circuito de los ejercicios.</p>
            </div>
          )}
        </div>

        <aside className="editor-panel">
          {porRevisar.length > 0 && (
            <section className="editor-revisar">
              <h4>Revisar primero</h4>
              <p className="editor-mini">El reconocimiento tiene poca confianza en estos elementos (resaltados en amarillo):</p>
              <ul>
                {porRevisar.map(({ c, min }) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => setSeleccion({ clase: 'componente', id: c.id })}>
                      {c.id} · {c.texto ?? formatearValor(c.valor, c.tipo)} · {Math.round(min * 100)} %
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Inspector
            key={seleccion?.id ?? 'nada'}
            seleccion={seleccion}
            sel={sel}
            doc={doc}
            cambiar={cambiar}
            borrar={() => borrar(seleccion)}
            rotar={rotarSeleccion}
          />
          <button type="button" className="editor-calcular" onClick={() => onCalcular(doc)} disabled={!doc.componentes.length}>
            Calcular ▶
          </button>
          <p className="editor-mini">Atajos: R rota · Supr borra · Ctrl+Z deshace · Ctrl+Y rehace · Esc selecciona.</p>
        </aside>
      </div>

      {/* Copia limpia para exportar */}
      <div className="editor-oculto" aria-hidden="true">
        <Esquema ref={exportRef} doc={doc} fondo="#ffffff" maxAncho={4000} />
      </div>
    </div>
  );
}

function SimboloBoton({ tipo, texto }) {
  if (!esComponente(tipo)) return <span className="editor-ico">{texto}</span>;
  const doc = { componentes: [{ id: 'x', tipo, x: 0, y: 0, rot: 0, valor: 1, nombre: ' ', texto: '' }], cables: [], nodos: [], etiquetas: [] };
  return (
    <svg className="editor-ico-svg" viewBox={`-6 -14 ${LARGO * G + 12} 28`} aria-hidden="true">
      <CapaEsquema doc={doc} />
    </svg>
  );
}

function Inspector({ seleccion, sel, doc, cambiar, borrar, rotar }) {
  const [texto, setTexto] = useState(sel?.texto ?? (sel?.valor != null && sel?.tipo ? formatearValor(sel.valor, sel.tipo) : ''));
  const [nombre, setNombre] = useState(sel?.id ?? '');
  const [etiqueta, setEtiqueta] = useState(sel?.texto ?? '');
  const [error, setError] = useState('');

  if (!sel) {
    return (
      <section className="editor-inspector">
        <h4>Propiedades</h4>
        <p className="editor-mini">Selecciona un elemento para editar su valor o su nombre.</p>
        <p className="editor-mini">
          Componentes: {doc.componentes.length} · Cables: {doc.cables.length}
        </p>
      </section>
    );
  }

  const actualizar = (cambios) =>
    cambiar({ ...doc, componentes: doc.componentes.map((c) => (c.id === sel.id ? { ...c, ...cambios, revisar: false } : c)) });

  if (seleccion.clase === 'componente') {
    const aplicarValor = () => {
      const r = parsearValor(texto, sel.tipo);
      if (r.error) {
        setError(r.error);
        return;
      }
      setError('');
      actualizar({ valor: r.valor, texto: formatearValor(r.valor, sel.tipo, 4) });
      setTexto(formatearValor(r.valor, sel.tipo, 4));
    };
    const aplicarNombre = () => {
      const limpio = nombre.trim();
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(limpio)) {
        setError('El nombre debe empezar con una letra y solo llevar letras y números (por ejemplo R1, C2, E1).');
        return;
      }
      if (limpio !== sel.id && doc.componentes.some((c) => c.id === limpio)) {
        setError(`Ya existe un elemento llamado ${limpio}.`);
        return;
      }
      setError('');
      cambiar({ ...doc, componentes: doc.componentes.map((c) => (c.id === sel.id ? { ...c, id: limpio, revisar: false } : c)) });
    };
    const titulo = { fuente: 'Fuente DC', resistencia: 'Resistencia', condensador: 'Condensador' }[sel.tipo];
    return (
      <section className="editor-inspector">
        <h4>{titulo}</h4>
        <label className="editor-campo">
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={aplicarNombre} onKeyDown={(e) => e.key === 'Enter' && aplicarNombre()} />
        </label>
        <label className="editor-campo">
          Valor ({UNIDAD[sel.tipo]})
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={aplicarValor}
            onKeyDown={(e) => e.key === 'Enter' && aplicarValor()}
            placeholder={sel.tipo === 'resistencia' ? '4.7 kΩ' : sel.tipo === 'condensador' ? '10 µF' : '12 V'}
            inputMode="decimal"
          />
        </label>
        <p className="editor-mini">
          En SI: {sel.valor.toExponential(3)} {UNIDAD[sel.tipo]}. Prefijos: p, n, µ (o u), m, k, M.
        </p>
        {sel.tipo === 'fuente' && <p className="editor-mini">La placa larga es el terminal +. Rota la fuente para cambiar la polaridad.</p>}
        {sel.revisar && (
          <p className="editor-revisar-nota">
            Confianza del reconocimiento — elemento {pct(sel.confianza)}, valor {pct(sel.confianza_valor)}
            {sel.tipo === 'fuente' ? `, polaridad ${pct(sel.confianza_polaridad)}` : ''}.{' '}
            <button type="button" onClick={() => actualizar({})}>
              Marcar como revisado
            </button>
          </p>
        )}
        {error && <p className="editor-error">{error}</p>}
        <div className="editor-botones">
          <button type="button" onClick={rotar}>
            ⟳ Rotar
          </button>
          <button type="button" onClick={borrar}>
            ✕ Borrar
          </button>
        </div>
      </section>
    );
  }

  if (seleccion.clase === 'etiqueta') {
    const aplicar = () => {
      const t = etiqueta.trim();
      if (!t) return;
      cambiar({ ...doc, etiquetas: doc.etiquetas.map((e) => (e.id === sel.id ? { ...e, texto: t } : e)) });
    };
    return (
      <section className="editor-inspector">
        <h4>Etiqueta de punto</h4>
        <label className="editor-campo">
          Texto
          <input value={etiqueta} maxLength={4} onChange={(e) => setEtiqueta(e.target.value)} onBlur={aplicar} onKeyDown={(e) => e.key === 'Enter' && aplicar()} />
        </label>
        <p className="editor-mini">Debe estar sobre un cable o un terminal. Puntos unidos por cables son el mismo nodo.</p>
        <div className="editor-botones">
          <button type="button" onClick={borrar}>
            ✕ Borrar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="editor-inspector">
      <h4>{seleccion.clase === 'cable' ? 'Cable' : 'Nodo'}</h4>
      <p className="editor-mini">{seleccion.clase === 'cable' ? 'Arrástralo para moverlo.' : 'Un nodo une los cables que se cruzan en ese punto.'}</p>
      <div className="editor-botones">
        <button type="button" onClick={borrar}>
          ✕ Borrar
        </button>
      </div>
    </section>
  );
}

const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)} %`);
export { UMBRAL_CONFIANZA };

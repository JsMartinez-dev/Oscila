// Dibujo SVG de un documento del editor con símbolos estándar.
// Lo usan el editor (capa interactiva encima) y los diagramas automáticos de la solución.

import { forwardRef } from 'react';
import { LARGO, terminales, clave } from './geometria.js';
import { nombreLatex } from './formato.js';
import { formatearValor } from './unidades.js';

export const G = 20; // píxeles por unidad de cuadrícula

const COLOR = {
  linea: 'var(--esq-linea, #1f2937)',
  texto: 'var(--esq-texto, #111827)',
  suave: 'var(--esq-suave, #6b7280)',
  corriente: 'var(--esq-corriente, #059669)',
  malla: 'var(--esq-malla, #7c3aed)',
  seleccion: 'var(--esq-seleccion, #2563eb)',
  revisar: 'var(--esq-revisar, #facc15)',
};

/** "R_{13}" → { base: 'R', sub: '13' };  "\varepsilon" → { base: 'ε' } */
export function partirNombre(nombre) {
  const m = String(nombre).match(/^(\\?[A-Za-z]+)(?:_\{(.*)\})?$/);
  if (!m) return { base: nombre, sub: '' };
  const base = m[1] === '\\varepsilon' ? 'ε' : m[1];
  return { base, sub: m[2] ?? '' };
}

function Nombre({ nombre, x, y, anchor }) {
  const { base, sub } = partirNombre(nombre);
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={13} fontStyle="italic" fill={COLOR.texto}>
      {base}
      {sub && (
        <tspan dy={4} fontSize={10} fontStyle="normal">
          {sub}
        </tspan>
      )}
    </text>
  );
}

/** Símbolo dibujado a lo largo de +x desde (0,0) hasta (LARGO·G, 0). */
function Simbolo({ tipo }) {
  const L = LARGO * G;
  const st = { stroke: COLOR.linea, strokeWidth: 2, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' };
  if (tipo === 'resistencia') {
    const x0 = G;
    const x1 = 3 * G;
    const picos = 6;
    const a = 0.38 * G;
    const pts = [[0, 0], [x0, 0]];
    for (let i = 0; i < picos; i++) pts.push([x0 + ((i + 0.5) * (x1 - x0)) / picos, i % 2 ? a : -a]);
    pts.push([x1, 0], [L, 0]);
    return <polyline points={pts.map((p) => p.join(',')).join(' ')} {...st} />;
  }
  if (tipo === 'condensador') {
    const xa = 1.82 * G;
    const xb = 2.18 * G;
    return (
      <g {...st}>
        <line x1={0} y1={0} x2={xa} y2={0} />
        <line x1={xa} y1={-0.75 * G} x2={xa} y2={0.75 * G} strokeWidth={2.5} />
        <line x1={xb} y1={-0.75 * G} x2={xb} y2={0.75 * G} strokeWidth={2.5} />
        <line x1={xb} y1={0} x2={L} y2={0} />
      </g>
    );
  }
  // fuente DC: terminal − en x=0, + en x=L; placa larga = +
  const xc = 1.82 * G;
  const xl = 2.18 * G;
  return (
    <g {...st}>
      <line x1={0} y1={0} x2={xc} y2={0} />
      <line x1={xc} y1={-0.38 * G} x2={xc} y2={0.38 * G} strokeWidth={4} />
      <line x1={xl} y1={-0.8 * G} x2={xl} y2={0.8 * G} strokeWidth={2} />
      <line x1={xl} y1={0} x2={L} y2={0} />
    </g>
  );
}

function signos(c) {
  // Posición de "+" y "−" junto a las placas, del lado contrario a la etiqueta
  const t = terminales(c);
  const ux = (t.b.x - t.a.x) / LARGO;
  const uy = (t.b.y - t.a.y) / LARGO;
  const horizontal = uy === 0;
  const nx = horizontal ? 0 : -1;
  const ny = horizontal ? 1 : 0;
  const centro = { x: (t.a.x + t.b.x) / 2, y: (t.a.y + t.b.y) / 2 };
  const mas = { x: (centro.x + ux * 0.75 + nx * 0.85) * G, y: (centro.y + uy * 0.75 + ny * 0.85) * G };
  const menos = { x: (centro.x - ux * 0.75 + nx * 0.85) * G, y: (centro.y - uy * 0.75 + ny * 0.85) * G };
  return { mas, menos };
}

function etiquetaComponente(c) {
  const t = terminales(c);
  const cx = ((t.a.x + t.b.x) / 2) * G;
  const cy = ((t.a.y + t.b.y) / 2) * G;
  const horizontal = t.a.y === t.b.y;
  const nombre = c.nombre ?? nombreLatex(c.id, c.tipo);
  const texto = c.texto ?? formatearValor(c.valor, c.tipo);
  if (horizontal) return { nombre, texto, x: cx, y: cy - 1.6 * G, anchor: 'middle', dy: 0.8 * G };
  return { nombre, texto, x: cx + 1.0 * G, y: cy - 2, anchor: 'start', dy: 15 };
}

function Flecha({ x, y, ang, color, tam = 7 }) {
  const p = (dx, dy) => [x + dx * Math.cos(ang) - dy * Math.sin(ang), y + dx * Math.sin(ang) + dy * Math.cos(ang)];
  const pts = [p(tam, 0), p(-tam * 0.7, tam * 0.65), p(-tam * 0.7, -tam * 0.65)];
  return <polygon points={pts.map((q) => q.join(',')).join(' ')} fill={color} />;
}

/** Puntos de unión: donde llegan 3 o más segmentos, o nodos explícitos. */
export function puntosDeUnion(doc) {
  const grado = new Map();
  const sumar = (x, y) => grado.set(clave(x, y), (grado.get(clave(x, y)) ?? 0) + 1);
  for (const w of doc.cables ?? []) {
    sumar(w.x1, w.y1);
    sumar(w.x2, w.y2);
  }
  for (const c of doc.componentes ?? []) {
    const t = terminales(c);
    sumar(t.a.x, t.a.y);
    sumar(t.b.x, t.b.y);
  }
  // un extremo que cae en medio de otro cable también es unión (T)
  for (const w of doc.cables ?? []) {
    for (const [k] of grado) {
      const [x, y] = k.split(',').map(Number);
      const enMedio =
        (w.x1 === w.x2 && x === w.x1 && y > Math.min(w.y1, w.y2) && y < Math.max(w.y1, w.y2)) ||
        (w.y1 === w.y2 && y === w.y1 && x > Math.min(w.x1, w.x2) && x < Math.max(w.x1, w.x2));
      if (enMedio) grado.set(k, grado.get(k) + 2);
    }
  }
  const pts = [...grado].filter(([, g]) => g >= 3).map(([k]) => k.split(',').map(Number));
  for (const n of doc.nodos ?? []) pts.push([n.x, n.y]);
  return pts;
}

/** Caja que encierra el dibujo (en unidades de cuadrícula). */
export function limites(doc) {
  const xs = [];
  const ys = [];
  for (const c of doc.componentes ?? []) {
    const t = terminales(c);
    xs.push(t.a.x, t.b.x);
    ys.push(t.a.y, t.b.y);
  }
  for (const w of doc.cables ?? []) {
    xs.push(w.x1, w.x2);
    ys.push(w.y1, w.y2);
  }
  for (const e of [...(doc.etiquetas ?? []), ...(doc.nodos ?? [])]) {
    xs.push(e.x);
    ys.push(e.y);
  }
  if (!xs.length) return { x0: 0, y0: 0, x1: 10, y1: 6 };
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/**
 * Contenido SVG del dibujo (sin el elemento <svg>), para incrustarlo en el editor.
 * resaltados: Set de ids con confianza baja; seleccion: id seleccionado.
 */
export function CapaEsquema({ doc, anotaciones = null, resaltados = null, seleccion = null }) {
  const componentes = doc.componentes ?? [];
  return (
    <g fontFamily="system-ui, 'Segoe UI', sans-serif">
      {/* resaltado de revisión (amarillo) y selección */}
      {componentes.map((c) => {
        if (!(resaltados?.has(c.id) || seleccion === c.id)) return null;
        const t = terminales(c);
        const x = Math.min(t.a.x, t.b.x) * G - 0.6 * G;
        const y = Math.min(t.a.y, t.b.y) * G - 0.6 * G;
        const w = Math.abs(t.b.x - t.a.x) * G + 1.2 * G;
        const h = Math.abs(t.b.y - t.a.y) * G + 1.2 * G;
        return (
          <rect
            key={`r-${c.id}`}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={6}
            fill={resaltados?.has(c.id) ? COLOR.revisar : 'none'}
            fillOpacity={0.45}
            stroke={seleccion === c.id ? COLOR.seleccion : 'none'}
            strokeWidth={2}
            strokeDasharray={seleccion === c.id ? '5 3' : undefined}
          />
        );
      })}

      {(doc.cables ?? []).map((w) => (
        <line
          key={w.id}
          x1={w.x1 * G}
          y1={w.y1 * G}
          x2={w.x2 * G}
          y2={w.y2 * G}
          stroke={seleccion === w.id ? COLOR.seleccion : COLOR.linea}
          strokeWidth={seleccion === w.id ? 3 : 2}
          strokeLinecap="round"
        />
      ))}

      {componentes.map((c) => {
        const ang = ((c.rot % 360) + 360) % 360;
        const et = etiquetaComponente(c);
        const sg = c.tipo === 'fuente' ? signos(c) : null;
        return (
          <g key={c.id}>
            <g transform={`translate(${c.x * G},${c.y * G}) rotate(${ang})`}>
              <Simbolo tipo={c.tipo} />
            </g>
            <Nombre nombre={et.nombre} x={et.x} y={et.y} anchor={et.anchor} />
            <text x={et.x} y={et.y + (et.dy || 15)} textAnchor={et.anchor} fontSize={12} fill={COLOR.suave}>
              {et.texto}
            </text>
            {sg && (
              <>
                <text x={sg.mas.x} y={sg.mas.y + 5} textAnchor="middle" fontSize={15} fill={COLOR.texto}>
                  +
                </text>
                <text x={sg.menos.x} y={sg.menos.y + 5} textAnchor="middle" fontSize={15} fill={COLOR.texto}>
                  −
                </text>
              </>
            )}
          </g>
        );
      })}

      {puntosDeUnion(doc).map(([x, y]) => (
        <circle key={`u-${x},${y}`} cx={x * G} cy={y * G} r={3.6} fill={COLOR.linea} />
      ))}

      {(doc.etiquetas ?? []).map((e) => (
        <g key={e.id}>
          <circle cx={e.x * G} cy={e.y * G} r={4} fill={seleccion === e.id ? COLOR.seleccion : COLOR.linea} />
          <text x={e.x * G - 6} y={e.y * G - 8} textAnchor="end" fontSize={15} fontStyle="italic" fill={seleccion === e.id ? COLOR.seleccion : COLOR.texto}>
            {e.texto}
          </text>
        </g>
      ))}

      {anotaciones?.corrientes?.map((a) => {
        const c = componentes.find((x) => x.id === a.id);
        if (!c) return null;
        const t = terminales(c);
        const [p, q] = a.sentido === 'ab' ? [t.a, t.b] : [t.b, t.a];
        const ux = (q.x - p.x) / LARGO;
        const uy = (q.y - p.y) / LARGO;
        // flecha sobre el tramo de cable antes del símbolo
        const x = (p.x + ux * 0.5) * G;
        const y = (p.y + uy * 0.5) * G;
        const horizontal = uy === 0;
        return (
          <g key={`i-${a.id}`}>
            <Flecha x={x} y={y} ang={Math.atan2(uy, ux)} color={COLOR.corriente} />
            <text
              x={x + (horizontal ? 0 : -10)}
              y={y + (horizontal ? 20 : 5)}
              textAnchor={horizontal ? 'middle' : 'end'}
              fontSize={13}
              fontStyle="italic"
              fill={COLOR.corriente}
            >
              {a.etiqueta[0]}
              <tspan dy={4} fontSize={10} fontStyle="normal">
                {a.etiqueta.slice(1)}
              </tspan>
            </text>
          </g>
        );
      })}

      {anotaciones?.mallas?.map((m) => {
        const cx = m.centro.x * G;
        const cy = m.centro.y * G;
        const r = 1.3 * G;
        const a0 = (-60 * Math.PI) / 180;
        const a1 = (230 * Math.PI) / 180;
        const x0 = cx + r * Math.cos(a0);
        const y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        return (
          <g key={`m-${m.etiqueta}`}>
            <path d={`M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`} fill="none" stroke={COLOR.malla} strokeWidth={2} />
            <Flecha x={x1} y={y1} ang={a1 + Math.PI / 2} color={COLOR.malla} tam={6} />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontStyle="italic" fill={COLOR.malla}>
              {m.etiqueta[0]}
              <tspan dy={4} fontSize={10} fontStyle="normal">
                {m.etiqueta.slice(1)}
              </tspan>
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Dibujo autónomo (para la solución y la exportación). */
export const Esquema = forwardRef(function Esquema({ doc, anotaciones, resaltados, titulo, maxAncho = 640, fondo = null }, ref) {
  const b = limites(doc);
  const m = 2.2; // margen en unidades
  const x = (b.x0 - m) * G;
  const y = (b.y0 - m) * G;
  const w = (b.x1 - b.x0 + 2 * m + 1.5) * G;
  const h = (b.y1 - b.y0 + 2 * m) * G;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${x} ${y} ${w} ${h}`}
      width={Math.min(maxAncho, w)}
      style={{ maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={titulo ?? 'Esquema del circuito'}
    >
      {fondo && <rect x={x} y={y} width={w} height={h} fill={fondo} />}
      <CapaEsquema doc={doc} anotaciones={anotaciones} resaltados={resaltados} />
    </svg>
  );
});

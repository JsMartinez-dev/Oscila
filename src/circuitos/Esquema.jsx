// Dibujo SVG de un documento del editor con símbolos estándar.
// Lo usan el editor (capa interactiva encima) y los diagramas automáticos de la solución.

import { forwardRef } from 'react';
import { LARGO, terminales, clave, puntosDeUnion } from './geometria.js';
import { nombreLatex } from './formato.js';
import { formatearValor } from './unidades.js';

export { puntosDeUnion };

export const G = 20; // píxeles por unidad de cuadrícula

const COLOR = {
  linea: 'var(--esq-linea, #111827)',
  texto: 'var(--esq-texto, #111827)',
  suave: 'var(--esq-suave, #4b5563)',
  corriente: 'var(--esq-corriente, #0f6b3f)',
  malla: 'var(--esq-malla, #6b2fb3)',
  nodo: 'var(--esq-nodo, #1d4f91)',
  seleccion: 'var(--esq-seleccion, #1d4f91)',
  revisar: 'var(--esq-revisar, #facc15)',
  fondo: 'var(--esq-fondo, #ffffff)',
};

const FUENTE = "var(--fuente, 'Lexend Variable', system-ui, 'Segoe UI', sans-serif)";

// Medidas de texto y símbolos
const T_NOMBRE = 13;
const T_VALOR = 12;
const T_SUB = 10;
const T_SIGNO = 15;
const T_PUNTO = 15;
const T_ANOT = 13;
const SEP = 5;
const MEDIA = { resistencia: 0.38 * G, condensador: 0.75 * G, fuente: 0.8 * G };

export function partirNombreNodo(etiqueta) {
  const s = String(etiqueta).trim();
  const mSub = s.match(/^([A-Za-z]+)_\{?(\d+)\}?$/);
  if (mSub) return { base: mSub[1], sub: mSub[2] };
  const mNum = s.match(/^([A-Za-z]+)(\d+)$/);
  if (mNum) return { base: mNum[1], sub: mNum[2] };
  return { base: s, sub: '' };
}

/** "R_{13}" → { base: 'R', sub: '13' };  "\varepsilon" → { base: 'ε' } */
export function partirNombre(nombre) {
  const m = String(nombre).match(/^(\\?[A-Za-z]+)(?:_\{(.*)\})?$/);
  if (!m) return { base: nombre, sub: '' };
  const base = m[1] === '\\varepsilon' ? 'ε' : m[1];
  return { base, sub: m[2] ?? '' };
}

// Cajas de texto
function cajaTexto(x, y, texto, tam, anchor, sub = '') {
  const w = (String(texto).length * tam + String(sub).length * T_SUB) * 0.6;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return { x0, y0: y - 0.72 * tam, x1: x0 + w, y1: y + (sub ? 4 + 0.22 * T_SUB : 0.22 * tam) };
}

function Nombre({ nombre, x, y, anchor }) {
  const { base, sub } = partirNombre(nombre);
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={T_NOMBRE} fontStyle="italic" fill={COLOR.texto}>
      {base}
      {sub && (
        <tspan dy={4} fontSize={T_SUB} fontStyle="normal">
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
    const a = MEDIA.resistencia;
    const pts = [[0, 0], [x0, 0]];
    for (let i = 0; i < picos; i++) pts.push([x0 + ((i + 0.5) * (x1 - x0)) / picos, i % 2 ? a : -a]);
    pts.push([x1, 0], [L, 0]);
    return <polyline points={pts.map((p) => p.join(',')).join(' ')} {...st} />;
  }
  if (tipo === 'condensador') {
    const xa = 1.82 * G;
    const xb = 2.18 * G;
    const h = MEDIA.condensador;
    return (
      <g {...st}>
        <line x1={0} y1={0} x2={xa} y2={0} />
        <line x1={xa} y1={-h} x2={xa} y2={h} strokeWidth={2.5} />
        <line x1={xb} y1={-h} x2={xb} y2={h} strokeWidth={2.5} />
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
      <line x1={xl} y1={-MEDIA.fuente} x2={xl} y2={MEDIA.fuente} strokeWidth={2} />
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

export function etiquetaComponente(c) {
  const t = terminales(c);
  const cx = ((t.a.x + t.b.x) / 2) * G;
  const cy = ((t.a.y + t.b.y) / 2) * G;
  const horizontal = t.a.y === t.b.y;
  const nombre = c.nombre ?? nombreLatex(c.id, c.tipo);
  const texto = c.texto ?? formatearValor(c.valor, c.tipo);
  const media = MEDIA[c.tipo] ?? MEDIA.resistencia;
  if (horizontal) {
    const yValor = cy - media - SEP - 0.22 * T_VALOR;
    return { nombre, texto, x: cx, y: yValor - 17, anchor: 'middle', dy: 17 };
  }
  return { nombre, texto, x: cx + Math.max(media + SEP + 2, G), y: cy - 2, anchor: 'start', dy: 15 };
}

function Flecha({ x, y, ang, color, tam = 7 }) {
  const p = (dx, dy) => [x + dx * Math.cos(ang) - dy * Math.sin(ang), y + dx * Math.sin(ang) + dy * Math.cos(ang)];
  const pts = [p(tam, 0), p(-tam * 0.7, tam * 0.65), p(-tam * 0.7, -tam * 0.65)];
  return <polygon points={pts.map((q) => q.join(',')).join(' ')} fill={color} />;
}

// Anotaciones
function flechaCorriente(a, componentes) {
  let p;
  let ux;
  let uy;
  if (a.tramo) {
    const [u, v] = a.sentido === 'ab' ? [a.tramo.p, a.tramo.q] : [a.tramo.q, a.tramo.p];
    const l = Math.hypot(v.x - u.x, v.y - u.y) || 1;
    ux = (v.x - u.x) / l;
    uy = (v.y - u.y) / l;
    p = { x: (u.x + v.x) / 2 - ux * 0.5, y: (u.y + v.y) / 2 - uy * 0.5 };
  } else {
    const c = componentes.find((x) => x.id === a.id);
    if (!c) return null;
    const t = terminales(c);
    const [u, v] = a.sentido === 'ab' ? [t.a, t.b] : [t.b, t.a];
    ux = (v.x - u.x) / LARGO;
    uy = (v.y - u.y) / LARGO;
    p = u;
  }
  const x = (p.x + ux * 0.5) * G;
  const y = (p.y + uy * 0.5) * G;
  const horizontal = Math.abs(uy) < 1e-9;
  const tx = x + (horizontal ? 0 : -10);
  const ty = y + (horizontal ? 21 : 5);
  const anchor = horizontal ? 'middle' : 'end';
  return { x, y, ang: Math.atan2(uy, ux), tx, ty, anchor };
}

const solapa = (a, b) => a.x0 + 1 < b.x1 && b.x0 + 1 < a.x1 && a.y0 + 1 < b.y1 && b.y0 + 1 < a.y1;
const rectCable = (c) => ({ x0: Math.min(c.x1, c.x2) - 1, x1: Math.max(c.x1, c.x2) + 1, y0: Math.min(c.y1, c.y2) - 1, y1: Math.max(c.y1, c.y2) + 1 });

function dentro(p, pol) {
  let si = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const a = pol[i];
    const b = pol[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) si = !si;
  }
  return si;
}

// Mallas
function ubicarMallas(doc, anotaciones) {
  const ms = anotaciones?.mallas ?? [];
  if (!ms.length || ms.every((m) => m.r)) return ms;
  const base = cajasDibujo(doc, { ...anotaciones, mallas: [] });
  const obstaculos = [...base.textos, ...base.cuerpos, ...base.cables.map(rectCable)];
  const puestas = [];
  return ms.map((m) => {
    if (!m.poligono?.length) return { ...m, r: 1.3 * G };
    const xs = m.poligono.map((p) => p.x);
    const ys = m.poligono.map((p) => p.y);
    const cands = [];
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 0.25)
      for (let y = Math.min(...ys); y <= Math.max(...ys); y += 0.25) if (dentro({ x, y }, m.poligono)) cands.push({ x, y });
    cands.sort((p, q) => Math.hypot(p.x - m.centro.x, p.y - m.centro.y) - Math.hypot(q.x - m.centro.x, q.y - m.centro.y));
    for (const r of [1.3 * G, 1.05 * G]) {
      const caja = (p) => ({ x0: p.x * G - r - 2, y0: p.y * G - r - 2, x1: p.x * G + r + 2, y1: p.y * G + r + 2 });
      const libre = cands.find((p) => !obstaculos.some((o) => solapa(caja(p), o)) && !puestas.some((o) => solapa(caja(p), o)));
      if (libre) {
        puestas.push(caja(libre));
        return { ...m, centro: libre, r };
      }
    }
    return { ...m, r: 1.3 * G };
  });
}

function etiquetaNodo(n) {
  const nx = n.x * G;
  const ny = n.y * G;
  const abajo = n.lado === 'abajo';
  return { nx, ny, tx: nx + 7, ty: abajo ? ny + 18 : ny - 7, anchor: 'start' };
}

// Cajas de textos y símbolos
export function cajasDibujo(doc, anotaciones = null) {
  const componentes = doc.componentes ?? [];
  const textos = [];
  const cuerpos = [];
  const patas = [];
  for (const c of componentes) {
    const et = etiquetaComponente(c);
    const { base, sub } = partirNombre(et.nombre);
    textos.push({ que: `nombre ${c.id}`, ...cajaTexto(et.x, et.y, base, T_NOMBRE, et.anchor, sub) });
    textos.push({ que: `valor ${c.id}`, ...cajaTexto(et.x, et.y + et.dy, et.texto, T_VALOR, et.anchor) });
    if (c.tipo === 'fuente') {
      const sg = signos(c);
      for (const [k, s] of [['+', sg.mas], ['−', sg.menos]]) textos.push({ que: `signo ${k} ${c.id}`, ...cajaTexto(s.x, s.y + 5, '+', T_SIGNO, 'middle') });
    }
    const t = terminales(c);
    const media = MEDIA[c.tipo] ?? MEDIA.resistencia;
    const [d0, d1] = c.tipo === 'resistencia' ? [G, 3 * G] : [1.82 * G, 2.18 * G];
    const ux = (t.b.x - t.a.x) / LARGO;
    const uy = (t.b.y - t.a.y) / LARGO;
    const en = (d) => ({ x: t.a.x * G + ux * d, y: t.a.y * G + uy * d });
    const [p0, p1] = [en(d0), en(d1)];
    const horizontal = t.a.y === t.b.y;
    cuerpos.push({
      que: `cuerpo ${c.id}`,
      x0: Math.min(p0.x, p1.x) - (horizontal ? 0 : media),
      x1: Math.max(p0.x, p1.x) + (horizontal ? 0 : media),
      y0: Math.min(p0.y, p1.y) - (horizontal ? media : 0),
      y1: Math.max(p0.y, p1.y) + (horizontal ? media : 0),
    });
    patas.push({ x1: t.a.x * G, y1: t.a.y * G, x2: p0.x, y2: p0.y }, { x1: p1.x, y1: p1.y, x2: t.b.x * G, y2: t.b.y * G });
  }
  for (const e of doc.etiquetas ?? []) textos.push({ que: `punto ${e.texto}`, ...cajaTexto(e.x * G - 6, e.y * G - 8, e.texto, T_PUNTO, 'end') });
  for (const a of anotaciones?.corrientes ?? []) {
    const f = flechaCorriente(a, componentes);
    if (f) textos.push({ que: `corriente ${a.etiqueta}`, ...cajaTexto(f.tx, f.ty, a.etiqueta[0], T_ANOT, f.anchor, a.etiqueta.slice(1)) });
  }
  for (const m of ubicarMallas(doc, anotaciones)) {
    const r = m.r + 2;
    textos.push({ que: `malla ${m.etiqueta}`, x0: m.centro.x * G - r, y0: m.centro.y * G - r, x1: m.centro.x * G + r, y1: m.centro.y * G + r });
  }
  for (const n of anotaciones?.nodos ?? []) {
    const p = etiquetaNodo(n);
    const { base, sub } = partirNombreNodo(n.etiqueta);
    textos.push({ que: `nodo ${n.etiqueta}`, ...cajaTexto(p.tx, p.ty, base, 14, p.anchor, sub) });
  }
  const cables = [...(doc.cables ?? []).map((w) => ({ x1: w.x1 * G, y1: w.y1 * G, x2: w.x2 * G, y2: w.y2 * G })), ...patas];
  return { textos, cuerpos, cables };
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

function limitesConTextos(doc, anotaciones) {
  const b = limites(doc);
  const cajas = cajasDibujo(doc, anotaciones).textos;
  return {
    x0: Math.min(b.x0, ...cajas.map((c) => c.x0 / G)),
    y0: Math.min(b.y0, ...cajas.map((c) => c.y0 / G)),
    x1: Math.max(b.x1, ...cajas.map((c) => c.x1 / G)),
    y1: Math.max(b.y1, ...cajas.map((c) => c.y1 / G)),
  };
}

/**
 * Contenido SVG del dibujo (sin el elemento <svg>), para incrustarlo en el editor.
 * resaltados: Set de ids con confianza baja; seleccion: id seleccionado.
 */
export function CapaEsquema({ doc, anotaciones = null, resaltados = null, seleccion = null }) {
  const componentes = doc.componentes ?? [];
  return (
    <g style={{ fontFamily: FUENTE }}>
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
            <text x={et.x} y={et.y + et.dy} textAnchor={et.anchor} fontSize={T_VALOR} fill={COLOR.suave}>
              {et.texto}
            </text>
            {sg && (
              <>
                <text x={sg.mas.x} y={sg.mas.y + 5} textAnchor="middle" fontSize={T_SIGNO} fill={COLOR.texto}>
                  +
                </text>
                <text x={sg.menos.x} y={sg.menos.y + 5} textAnchor="middle" fontSize={T_SIGNO} fill={COLOR.texto}>
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
          <text x={e.x * G - 6} y={e.y * G - 8} textAnchor="end" fontSize={T_PUNTO} fontStyle="italic" fill={seleccion === e.id ? COLOR.seleccion : COLOR.texto}>
            {e.texto}
          </text>
        </g>
      ))}

      {anotaciones?.corrientes?.map((a) => {
        const f = flechaCorriente(a, componentes);
        if (!f) return null;
        return (
          <g key={`i-${a.etiqueta}`}>
            <Flecha x={f.x} y={f.y} ang={f.ang} color={COLOR.corriente} />
            <text x={f.tx} y={f.ty} textAnchor={f.anchor} fontSize={T_ANOT} fontStyle="italic" fill={COLOR.corriente}>
              {a.etiqueta[0]}
              <tspan dy={4} fontSize={T_SUB} fontStyle="normal">
                {a.etiqueta.slice(1)}
              </tspan>
            </text>
          </g>
        );
      })}

      {ubicarMallas(doc, anotaciones).map((m) => {
        const cx = m.centro.x * G;
        const cy = m.centro.y * G;
        const r = m.r;
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
              <tspan dy={4} fontSize={T_SUB} fontStyle="normal">
                {m.etiqueta.slice(1)}
              </tspan>
            </text>
          </g>
        );
      })}

      {anotaciones?.nodos?.map((n) => {
        const p = etiquetaNodo(n);
        const { base, sub } = partirNombreNodo(n.etiqueta);
        return (
          <g key={`nodo-${n.etiqueta}-${n.x}-${n.y}`}>
            <circle cx={p.nx} cy={p.ny} r={4.5} fill={COLOR.nodo} stroke={COLOR.fondo} strokeWidth={1.5} />
            <text
              x={p.tx}
              y={p.ty}
              textAnchor={p.anchor}
              fontSize={14}
              fontWeight="600"
              fontStyle="italic"
              fill={COLOR.nodo}
              paintOrder="stroke"
              stroke={COLOR.fondo}
              strokeWidth={3}
              strokeLinejoin="round"
            >
              {base}
              {sub && (
                <tspan dy={3} fontSize={T_SUB} fontStyle="normal" fontWeight="bold">
                  {sub}
                </tspan>
              )}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Dibujo autónomo (para la solución y la exportación). */
export const Esquema = forwardRef(function Esquema({ doc, anotaciones, resaltados, titulo, maxAncho = 640, fondo = null }, ref) {
  const b = limitesConTextos(doc, anotaciones);
  const m = 0.8; // margen en unidades
  const x = (b.x0 - m) * G;
  const y = (b.y0 - m) * G;
  const w = (b.x1 - b.x0 + 2 * m) * G;
  const h = (b.y1 - b.y0 + 2 * m) * G;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${x} ${y} ${w} ${h}`}
      width={Math.min(maxAncho, w)}
      height={(Math.min(maxAncho, w) * h) / w}
      style={{ maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={titulo ?? 'Esquema del circuito'}
    >
      {fondo && <rect x={x} y={y} width={w} height={h} fill={fondo} />}
      <CapaEsquema doc={doc} anotaciones={anotaciones} resaltados={resaltados} />
    </svg>
  );
});

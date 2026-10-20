// Geometría del documento del editor: terminales, cables partidos en uniones y conectividad.
//
// Documento del editor:
// {
//   componentes: [{ id, tipo: 'fuente'|'resistencia'|'condensador', x, y, rot: 0|90|180|270, valor, texto }],
//   cables:      [{ id, x1, y1, x2, y2 }],   // segmentos horizontales o verticales
//   nodos:       [{ id, x, y }],             // punto de unión explícito (une cables que se cruzan)
//   etiquetas:   [{ id, x, y, texto }],      // nombre de un punto (a, b, c…)
//   curso:       { ejercicio, corrientes, ramas }   // opcional: solución del curso (ejemplos.js)
//   ramasCable:  [['b', 'c']]
// }
// Coordenadas en unidades de cuadrícula; "y" crece hacia abajo (pantalla).
// En la fuente, el terminal "a" es el − y el terminal "b" es el +.

export const LARGO = 4; // longitud de un componente en unidades de cuadrícula

const DIR = { 0: [1, 0], 90: [0, 1], 180: [-1, 0], 270: [0, -1] };

export const clave = (x, y) => `${x},${y}`;
export const desdeClave = (k) => {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
};

export function terminales(c) {
  const [dx, dy] = DIR[((c.rot % 360) + 360) % 360] ?? DIR[0];
  return { a: { x: c.x, y: c.y }, b: { x: c.x + LARGO * dx, y: c.y + LARGO * dy } };
}

/** ¿El punto p está sobre el segmento (incluidos extremos)? Solo segmentos ortogonales o diagonales simples. */
export function sobreSegmento(p, s) {
  const { x1, y1, x2, y2 } = s;
  const cruz = (x2 - x1) * (p.y - y1) - (y2 - y1) * (p.x - x1);
  if (Math.abs(cruz) > 1e-9) return false;
  return p.x >= Math.min(x1, x2) - 1e-9 && p.x <= Math.max(x1, x2) + 1e-9 && p.y >= Math.min(y1, y2) - 1e-9 && p.y <= Math.max(y1, y2) + 1e-9;
}

class UnionFind {
  constructor() {
    this.padre = new Map();
  }
  agregar(k) {
    if (!this.padre.has(k)) this.padre.set(k, k);
  }
  raiz(k) {
    this.agregar(k);
    let r = k;
    while (this.padre.get(r) !== r) r = this.padre.get(r);
    let x = k;
    while (this.padre.get(x) !== r) {
      const sig = this.padre.get(x);
      this.padre.set(x, r);
      x = sig;
    }
    return r;
  }
  unir(a, b) {
    const ra = this.raiz(a);
    const rb = this.raiz(b);
    if (ra !== rb) this.padre.set(ra, rb);
  }
}

/**
 * Analiza el documento: parte cada cable en los puntos que tiene encima (terminales, extremos de
 * otros cables, nodos explícitos) y agrupa los puntos conectados.
 * Devuelve { segmentos, uf, puntosTerminal, terminalesPorComp, cortes }.
 */
export function analizarGeometria(doc) {
  const componentes = doc.componentes ?? [];
  const cables = (doc.cables ?? []).filter((c) => c.x1 !== c.x2 || c.y1 !== c.y2);
  const nodos = doc.nodos ?? [];

  const uf = new UnionFind();
  const terminalesPorComp = new Map();
  const puntosEspeciales = new Map(); // clave → {x,y}

  for (const c of componentes) {
    const t = terminales(c);
    terminalesPorComp.set(c.id, t);
    for (const p of [t.a, t.b]) {
      puntosEspeciales.set(clave(p.x, p.y), p);
      uf.agregar(clave(p.x, p.y));
    }
  }
  for (const w of cables) {
    for (const p of [{ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }]) {
      puntosEspeciales.set(clave(p.x, p.y), p);
      uf.agregar(clave(p.x, p.y));
    }
  }
  for (const n of nodos) {
    puntosEspeciales.set(clave(n.x, n.y), { x: n.x, y: n.y });
    uf.agregar(clave(n.x, n.y));
  }
  // Las etiquetas parten el cable sobre el que están (para que aparezcan en el recorrido de las mallas)
  for (const e of doc.etiquetas ?? []) {
    if (!cables.some((w) => sobreSegmento(e, w)) && !puntosEspeciales.has(clave(e.x, e.y))) continue;
    puntosEspeciales.set(clave(e.x, e.y), { x: e.x, y: e.y });
    uf.agregar(clave(e.x, e.y));
  }

  const textoEn = new Map((doc.etiquetas ?? []).map((e) => [clave(e.x, e.y), e.texto.trim()]));
  const pares = new Set((doc.ramasCable ?? []).flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));
  const esCorte = (p, q) => pares.has(`${textoEn.get(clave(p.x, p.y))}|${textoEn.get(clave(q.x, q.y))}`);
  const cortes = [];
  const segmentos = [];
  for (const w of cables) {
    const encima = [...puntosEspeciales.values()].filter((p) => sobreSegmento(p, w));
    const horizontal = Math.abs(w.x2 - w.x1) >= Math.abs(w.y2 - w.y1);
    encima.sort((p, q) => (horizontal ? p.x - q.x : p.y - q.y));
    for (let i = 0; i < encima.length - 1; i++) {
      const p = encima[i];
      const q = encima[i + 1];
      if (esCorte(p, q)) cortes.push({ p, q, de: textoEn.get(clave(p.x, p.y)), a: textoEn.get(clave(q.x, q.y)) });
      else uf.unir(clave(p.x, p.y), clave(q.x, q.y));
      segmentos.push({ tipo: 'cable', cable: w.id, p, q });
    }
  }
  for (const c of componentes) {
    const t = terminalesPorComp.get(c.id);
    segmentos.push({ tipo: 'componente', elemento: c.id, p: t.a, q: t.b });
  }

  return { segmentos, uf, terminalesPorComp, puntosEspeciales, cortes };
}

/** Intersección propia de dos segmentos (no cuenta extremos compartidos ni puntos sobre extremos). */
export function seCruzan(s, t) {
  const pts = [s.p, s.q];
  const comparten = pts.some((a) => [t.p, t.q].some((b) => a.x === b.x && a.y === b.y));
  const orient = (a, b, c) => Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  const o1 = orient(s.p, s.q, t.p);
  const o2 = orient(s.p, s.q, t.q);
  const o3 = orient(t.p, t.q, s.p);
  const o4 = orient(t.p, t.q, s.q);
  if (o1 === 0 && o2 === 0) {
    // Colineales: se cruzan si se solapan en más de un punto.
    const proy = (a) => (s.p.x !== s.q.x ? a.x : a.y);
    const [a1, a2] = [proy(s.p), proy(s.q)].sort((m, n) => m - n);
    const [b1, b2] = [proy(t.p), proy(t.q)].sort((m, n) => m - n);
    return Math.min(a2, b2) - Math.max(a1, b1) > 1e-9;
  }
  if (comparten) return false;
  if (o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0) return true;
  return false;
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


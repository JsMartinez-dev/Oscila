// Dibujo automático de esquemas limpios (cables ortogonales, símbolos estándar, sin etiquetas encimadas).
//
// dibujarReduccion: a partir del árbol serie/paralelo: serie → en fila, paralelo → apilado en vertical,
// con la fuente a la izquierda cerrando el lazo. Devuelve un documento del editor.

import { LARGO } from './geometria.js';
import { formatearValor } from './unidades.js';

const ANCHO_HOJA = LARGO + 2;
const ALTO_HOJA = 4;

/**
 * red: resultado de reducir(); corte: Set de ids de aristas que se dibujan como un solo elemento
 * (null = circuito original, todas las hojas).
 */
export function dibujarReduccion(red, corte) {
  const tipoComp = red.tipoRed === 'R' ? 'resistencia' : 'condensador';
  const componentes = [];
  const cables = [];
  const medidas = new Map();
  let maxY = 0;

  const esHoja = (x) => x.tipo === 'hoja' || (corte && corte.has(x.id));

  const medir = (x) => {
    if (medidas.has(x.id)) return medidas.get(x.id);
    let m;
    if (esHoja(x)) m = { w: ANCHO_HOJA, h: ALTO_HOJA };
    else if (x.tipo === 'serie') {
      const ms = x.hijos.map(medir);
      m = { w: ms.reduce((s, c) => s + c.w, 0), h: Math.max(...ms.map((c) => c.h)) };
    } else {
      const ms = x.hijos.map(medir);
      m = { w: Math.max(...ms.map((c) => c.w)) + 2, h: ms.reduce((s, c) => s + c.h, 0) };
    }
    medidas.set(x.id, m);
    return m;
  };

  const cable = (x1, y1, x2, y2) => {
    if (x1 !== x2 || y1 !== y2) cables.push({ id: `w${cables.length + 1}`, x1, y1, x2, y2 });
  };

  // desde: nodo eléctrico que queda a la izquierda del bloque
  const colocar = (x, desde, ox, oy) => {
    const { w } = medir(x);
    if (esHoja(x)) {
      maxY = Math.max(maxY, oy);
      cable(ox, oy, ox + 1, oy);
      componentes.push({
        id: x.id,
        tipo: tipoComp,
        x: ox + 1,
        y: oy,
        rot: 0,
        valor: x.valor,
        nombre: x.nombre,
        texto: formatearValor(x.valor, tipoComp),
      });
      cable(ox + 1 + LARGO, oy, ox + w, oy);
      return;
    }
    if (x.tipo === 'serie') {
      const hijos = desde === x.a ? x.hijos : [...x.hijos].reverse();
      let actual = desde;
      let cx = ox;
      for (const h of hijos) {
        colocar(h, actual, cx, oy);
        actual = h.a === actual ? h.b : h.a;
        cx += medir(h).w;
      }
      return;
    }
    // paralelo
    let y = oy;
    let ultima = oy;
    for (const h of x.hijos) {
      const mh = medir(h);
      cable(ox, y, ox + 1, y);
      colocar(h, desde, ox + 1, y);
      cable(ox + 1 + mh.w, y, ox + w, y);
      ultima = y;
      y += mh.h;
    }
    cable(ox, oy, ox, ultima);
    cable(ox + w, oy, ox + w, ultima);
  };

  const raiz = red.raiz;
  const m = medir(raiz);
  const X0 = 4;
  colocar(raiz, red.s, X0, 0);

  // Fuente vertical a la izquierda, + arriba
  const f = red.fuente;
  componentes.push({ id: f.id, tipo: 'fuente', x: 0, y: LARGO, rot: 270, valor: f.valor, nombre: '\\varepsilon', texto: formatearValor(f.valor, 'fuente') });
  const yb = Math.max(maxY + 2, LARGO + 1) + 1;
  cable(0, 0, X0, 0);
  cable(X0 + m.w, 0, X0 + m.w, yb);
  cable(X0 + m.w, yb, 0, yb);
  cable(0, yb, 0, LARGO);

  const etiquetas = [];
  const legible = (nombre) => nombre && !/^N\d+$/.test(nombre) && nombre.length <= 3;
  if (legible(red.s)) etiquetas.push({ id: 'e1', x: 1, y: 0, texto: red.s });
  if (legible(red.t)) etiquetas.push({ id: 'e2', x: 1, y: yb, texto: red.t });

  return { componentes, cables, nodos: [], etiquetas };
}

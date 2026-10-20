// Planteamiento por leyes de Kirchhoff con corrientes de rama:
//   (nodos principales − 1) ecuaciones de nodo  +  (ramas − nodos + 1) ecuaciones de malla.
// Convención de signos (hoja maestra):
//   resistencia recorrida a favor de I → −IR; en contra → +IR
//   fuente recorrida de − a + → +ε; de + a − → −ε

import { extremos } from './netlist.js';
import { mallasDelDibujo } from './mallas.js';

/** Elementos que pueden conducir corriente en DC: sin condensadores y sin ramas colgantes. */
export function elementosActivos(net) {
  let activos = net.elementos.filter((e) => e.tipo !== 'condensador' && extremos(e)[0] !== extremos(e)[1]);
  for (;;) {
    const grado = new Map();
    for (const e of activos) for (const v of extremos(e)) grado.set(v, (grado.get(v) ?? 0) + 1);
    const colg = activos.filter((e) => extremos(e).some((v) => grado.get(v) === 1));
    if (!colg.length) break;
    activos = activos.filter((e) => !colg.includes(e));
  }
  return activos;
}

const otroExtremo = (e, v) => {
  const [p, q] = extremos(e);
  return p === v ? q : p;
};

/**
 * Analiza la topología. geo (opcional) permite usar las ventanas del dibujo como mallas.
 * Devuelve { ok, error, ramas, principales, ecNodos, mallas, origenMallas, sinCorriente }.
 */
export function plantearKirchhoff(net, geo, opciones = {}) {
  const activos = elementosActivos(net);
  const idsActivos = new Set(activos.map((e) => e.id));
  const sinCorriente = net.elementos.filter((e) => !idsActivos.has(e.id)).map((e) => e.id);
  if (!activos.length) return { ok: false, error: 'No hay ningún camino cerrado por el que circule corriente.' };

  const incid = new Map();
  for (const e of activos) for (const v of extremos(e)) incid.set(v, [...(incid.get(v) ?? []), e]);
  const principales = [...incid.keys()].filter((v) => incid.get(v).length >= 3);
  const pos = geo?.posNodo ?? {};

  // --- Ramas
  const usados = new Set();
  const ramas = [];
  const caminar = (inicio, e0) => {
    const elems = [];
    let v = inicio;
    let e = e0;
    for (let g = 0; g <= activos.length; g++) {
      const w = otroExtremo(e, v);
      elems.push({ elem: e, desde: v, hacia: w });
      usados.add(e.id);
      v = w;
      if (principales.includes(v) || v === inicio) break;
      e = incid.get(v).find((x) => !usados.has(x.id));
      if (!e) break;
    }
    return { elems, desde: inicio, hacia: v };
  };
  if (principales.length === 0) {
    const v0 = extremos(activos[0])[0];
    ramas.push(caminar(v0, activos[0]));
  } else {
    for (const p of principales) for (const e of incid.get(p)) if (!usados.has(e.id)) ramas.push(caminar(p, e));
  }

  // Sentido supuesto: sale por el + de la primera fuente; si no hay fuente, "baja" en el dibujo
  for (const r of ramas) {
    const f = r.elems.find((x) => x.elem.tipo === 'fuente');
    let invertir = false;
    const tramo = r.elems.length === 1 && r.elems[0].elem.tipo === 'cable' ? geo?.cablesRama?.find((w) => w.id === r.elems[0].elem.id) : null;
    if (f) invertir = f.desde === f.elem.pos; // recorrida de + a −: invertir
    else if (tramo) {
      const [a, b] = geo.nodoDe(tramo.p) === r.desde ? [tramo.p, tramo.q] : [tramo.q, tramo.p];
      invertir = a.y > b.y + 1e-9 || (Math.abs(a.y - b.y) < 1e-9 && a.x > b.x);
    } else if (pos[r.desde] && pos[r.hacia]) {
      const a = pos[r.desde];
      const b = pos[r.hacia];
      invertir = a.y > b.y + 1e-9 || (Math.abs(a.y - b.y) < 1e-9 && a.x > b.x);
    }
    if (invertir) {
      r.elems = r.elems.reverse().map((x) => ({ elem: x.elem, desde: x.hacia, hacia: x.desde }));
      [r.desde, r.hacia] = [r.hacia, r.desde];
    }
    const pts = r.elems.flatMap((x) => [pos[x.desde], pos[x.hacia]]).filter(Boolean);
    r.cx = pts.length ? pts.reduce((s, p) => s + p.x, 0) / pts.length : 0;
  }
  const fijadas = ramas.map((r) => r.elems.map((x) => opciones.ramas?.[x.elem.id]).find(Boolean));
  const conCurso = fijadas.every(Boolean) && new Set(fijadas.map((f) => f.k)).size === ramas.length;
  if (conCurso) {
    ramas.forEach((r, i) => {
      r.fija = fijadas[i];
      if (r.hacia !== r.fija.hacia && r.desde === r.fija.hacia) {
        r.elems = r.elems.reverse().map((x) => ({ elem: x.elem, desde: x.hacia, hacia: x.desde }));
        [r.desde, r.hacia] = [r.hacia, r.desde];
      }
    });
    ramas.sort((a, b) => a.fija.k - b.fija.k);
  } else if (geo) ramas.sort((a, b) => a.cx - b.cx);
  ramas.forEach((r, i) => {
    r.k = i + 1;
    r.variable = `I_{${i + 1}}`;
  });
  const ramaDe = new Map();
  for (const r of ramas) for (const x of r.elems) ramaDe.set(x.elem.id, { rama: r, desde: x.desde });

  // --- Ecuaciones de nodo: todos los nodos principales menos uno (el último, de abajo a la derecha)
  const esquina = geo?.esquinaNodo ?? pos;
  const ordenNodos = [...principales].sort((a, b) => {
    const pa = esquina[a];
    const pb = esquina[b];
    if (pa && pb) return pa.y - pb.y || pa.x - pb.x;
    return 0;
  });
  const ecNodos = ordenNodos.slice(0, Math.max(0, ordenNodos.length - 1)).map((v) => ({
    nodo: v,
    entran: ramas.filter((r) => r.hacia === v && r.desde !== v),
    salen: ramas.filter((r) => r.desde === v && r.hacia !== v),
  }));

  // --- Mallas
  const necesarias = ramas.length - principales.length + (principales.length ? 1 : 0);
  let mallas = null;
  let origenMallas = 'dibujo';
  if (geo) {
    const m = mallasDelDibujo(geo, idsActivos);
    if (m && m.length === necesarias) mallas = m;
  }
  if (!mallas) {
    origenMallas = 'lazos';
    mallas = lazosFundamentales(ramas, principales, pos).slice(0, necesarias);
  }

  // Cada malla: términos en el orden del recorrido
  for (const m of mallas) {
    m.terminos = m.recorrido.flatMap(({ id, desde }) => {
      const { rama, desde: d0 } = ramaDe.get(id);
      const elem = rama.elems.find((x) => x.elem.id === id).elem;
      const aFavor = desde === d0;
      if (elem.tipo === 'cable') return [];
      if (elem.tipo === 'fuente') {
        const deMenosAMas = desde === elem.neg;
        return { tipo: 'fuente', elem, valor: deMenosAMas ? elem.valor : -elem.valor };
      }
      return { tipo: 'resistencia', elem, rama, coef: aFavor ? -elem.valor : elem.valor };
    });
  }

  return { ok: true, ramas, principales: ordenNodos, ecNodos, mallas, origenMallas, sinCorriente, necesarias, conCurso };
}

/** Lazos fundamentales de un árbol generador sobre el grafo de ramas, orientados en horario si hay posiciones. */
function lazosFundamentales(ramas, principales, pos) {
  if (!principales.length) {
    const r = ramas[0];
    return [orientar({ recorrido: r.elems.map((x) => ({ id: x.elem.id, desde: x.desde, hacia: x.hacia })), ruta: [] }, pos)];
  }
  const vec = new Map(principales.map((v) => [v, []]));
  for (const r of ramas) {
    vec.get(r.desde).push({ r, a: r.hacia, sentido: 1 });
    vec.get(r.hacia).push({ r, a: r.desde, sentido: -1 });
  }
  const padre = new Map([[principales[0], null]]);
  const cola = [principales[0]];
  const enArbol = new Set();
  while (cola.length) {
    const v = cola.shift();
    for (const { r, a, sentido } of vec.get(v)) {
      if (padre.has(a)) continue;
      padre.set(a, { v, r, sentido });
      enArbol.add(r);
      cola.push(a);
    }
  }
  const caminoARaiz = (v) => {
    const c = [];
    while (padre.get(v)) {
      const p = padre.get(v);
      c.push({ r: p.r, sentido: -p.sentido, de: v, a: p.v });
      v = p.v;
    }
    return c;
  };
  const lazos = [];
  for (const r of ramas) {
    if (enArbol.has(r)) continue;
    // r: desde → hacia; volver de hacia a desde por el árbol
    const subir = caminoARaiz(r.hacia);
    const bajar = caminoARaiz(r.desde).reverse().map((x) => ({ r: x.r, sentido: -x.sentido, de: x.a, a: x.de }));
    // quitar el tramo común
    while (subir.length && bajar.length && subir[subir.length - 1].r === bajar[0].r) {
      subir.pop();
      bajar.shift();
    }
    const tramos = [{ r, sentido: 1 }, ...subir, ...bajar];
    const recorrido = [];
    for (const t of tramos) {
      const elems = t.sentido === 1 ? t.r.elems : [...t.r.elems].reverse().map((x) => ({ elem: x.elem, desde: x.hacia, hacia: x.desde }));
      for (const x of elems) recorrido.push({ id: x.elem.id, desde: x.desde, hacia: x.hacia });
    }
    lazos.push(orientar({ recorrido, ruta: [] }, pos));
  }
  return lazos;
}

function orientar(lazo, pos) {
  const nodos = lazo.recorrido.map((x) => x.desde);
  const pts = nodos.map((v) => pos[v]).filter(Boolean);
  if (pts.length === nodos.length && pts.length >= 3) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a += p.x * q.y - q.x * p.y;
    }
    if (a < 0) lazo.recorrido = lazo.recorrido.reverse().map((x) => ({ id: x.id, desde: x.hacia, hacia: x.desde }));
    lazo.centro = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
  }
  lazo.ruta = [...lazo.recorrido.map((x) => x.desde), lazo.recorrido[0]?.desde].filter(Boolean);
  return lazo;
}

/** Ecuaciones lineales { coef, c } listas para resolver (nodos primero, luego mallas). */
export function ecuacionesLineales(pl) {
  const ecs = [];
  for (const e of pl.ecNodos) {
    const coef = {};
    for (const r of e.entran) coef[r.variable] = (coef[r.variable] ?? 0) + 1;
    for (const r of e.salen) coef[r.variable] = (coef[r.variable] ?? 0) - 1;
    ecs.push({ coef, c: 0 });
  }
  for (const m of pl.mallas) {
    const coef = {};
    let c = 0;
    for (const t of m.terminos) {
      if (t.tipo === 'fuente') c -= t.valor;
      else coef[t.rama.variable] = (coef[t.rama.variable] ?? 0) + t.coef;
    }
    ecs.push({ coef, c });
  }
  return ecs;
}

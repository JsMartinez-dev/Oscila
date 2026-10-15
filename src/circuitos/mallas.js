// Mallas a partir del dibujo: las "ventanas" (caras internas) del circuito plano, recorridas en sentido horario.
// Si el dibujo tiene cruces sin nodo (no es plano) devuelve null y Kirchhoff usa lazos fundamentales.

import { clave, seCruzan } from './geometria.js';

/**
 * geo: resultado de docANetlist(doc).geo
 * activos: Set de ids de elementos que conducen corriente (sin condensadores ni ramas colgantes)
 * Devuelve [{ recorrido: [{ id, desde, hacia }], ruta: [nombres], centro: {x,y}, poligono }] o null.
 */
export function mallasDelDibujo(geo, activos) {
  let segs = geo.segmentos.filter((s) => s.tipo === 'cable' || activos.has(s.elemento));

  // Plano: ningún par de segmentos se cruza fuera de sus extremos
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      if (seCruzan(segs[i], segs[j])) return null;
    }
  }

  // Podar vértices de grado 1 (cables o ramas colgantes)
  for (;;) {
    const grado = new Map();
    for (const s of segs) for (const p of [s.p, s.q]) grado.set(clave(p.x, p.y), (grado.get(clave(p.x, p.y)) ?? 0) + 1);
    const quitar = segs.filter((s) => [s.p, s.q].some((p) => grado.get(clave(p.x, p.y)) === 1));
    if (!quitar.length) break;
    segs = segs.filter((s) => !quitar.includes(s));
  }
  if (!segs.length) return [];

  // Semiaristas ordenadas por ángulo alrededor de cada vértice
  const salientes = new Map();
  const semi = [];
  segs.forEach((s, i) => {
    for (const [u, v] of [[s.p, s.q], [s.q, s.p]]) {
      const h = { seg: s, i, u, v, ku: clave(u.x, u.y), kv: clave(v.x, v.y), ang: Math.atan2(v.y - u.y, v.x - u.x) };
      semi.push(h);
      if (!salientes.has(h.ku)) salientes.set(h.ku, []);
      salientes.get(h.ku).push(h);
    }
  });
  for (const lista of salientes.values()) lista.sort((a, b) => a.ang - b.ang);

  const siguiente = (h) => {
    const lista = salientes.get(h.kv);
    const idx = lista.findIndex((x) => x.i === h.i && x.kv === h.ku);
    return lista[(idx - 1 + lista.length) % lista.length];
  };

  const usada = new Set();
  const caras = [];
  for (const h0 of semi) {
    if (usada.has(h0)) continue;
    const cara = [];
    let h = h0;
    let guarda = 0;
    while (!usada.has(h) && guarda++ < semi.length + 2) {
      usada.add(h);
      cara.push(h);
      h = siguiente(h);
    }
    caras.push(cara);
  }

  const area = (cara) => cara.reduce((s, h) => s + (h.u.x * h.v.y - h.v.x * h.u.y), 0) / 2;
  const conArea = caras.map((c) => ({ cara: c, area: area(c) })).filter((c) => Math.abs(c.area) > 1e-9);
  if (conArea.length < 2) return conArea.length ? [] : [];
  let iExt = 0;
  conArea.forEach((c, i) => {
    if (Math.abs(c.area) > Math.abs(conArea[iExt].area)) iExt = i;
  });
  const internas = conArea.filter((_, i) => i !== iExt);

  return internas
    .map(({ cara, area: a }) => {
      // Horario en pantalla (y hacia abajo) ⇔ área de Gauss positiva
      let ciclo = cara.map((h) => ({ u: h.u, v: h.v, seg: h.seg }));
      if (a < 0) ciclo = ciclo.reverse().map((h) => ({ u: h.v, v: h.u, seg: h.seg }));
      // Empezar en el vértice de más arriba (y luego más a la izquierda)
      let ini = 0;
      ciclo.forEach((h, i) => {
        const b = ciclo[ini].u;
        if (h.u.y < b.y || (h.u.y === b.y && h.u.x < b.x)) ini = i;
      });
      ciclo = [...ciclo.slice(ini), ...ciclo.slice(0, ini)];

      // Elementos recorridos (un elemento recorrido de ida y de vuelta en la misma cara se cancela)
      let recorrido = ciclo
        .filter((h) => h.seg.tipo === 'componente')
        .map((h) => ({ id: h.seg.elemento, desde: geo.nodoDe(h.u), hacia: geo.nodoDe(h.v) }));
      const veces = new Map();
      for (const r of recorrido) veces.set(r.id, (veces.get(r.id) ?? 0) + 1);
      recorrido = recorrido.filter((r) => veces.get(r.id) === 1);

      // Ruta para mostrar: etiquetas de los puntos del borde; si no hay suficientes, nombres de nodos
      const etiquetas = [];
      for (const h of ciclo) {
        const e = geo.etiquetaPunto.get(clave(h.u.x, h.u.y));
        if (e && etiquetas[etiquetas.length - 1] !== e) etiquetas.push(e);
      }
      let ruta = etiquetas;
      if (ruta.length < 3) {
        ruta = [];
        for (const h of ciclo) {
          const nodo = geo.nodoDe(h.u);
          if (nodo && ruta[ruta.length - 1] !== nodo) ruta.push(nodo);
        }
        if (ruta.length > 1 && ruta[0] === ruta[ruta.length - 1]) ruta.pop();
      }
      if (ruta.length) ruta = [...ruta, ruta[0]];

      const poligono = ciclo.map((h) => h.u);
      const cx = poligono.reduce((s, p) => s + p.x, 0) / poligono.length;
      const cy = poligono.reduce((s, p) => s + p.y, 0) / poligono.length;
      return { recorrido, ruta, centro: { x: cx, y: cy }, poligono };
    })
    .sort((m1, m2) => m1.centro.x - m2.centro.x || m1.centro.y - m2.centro.y);
}

// Netlist: esquema, validación y conversión desde el documento del editor.
//
// Formato (el mismo de paquete_EyM/casos/casos_prueba_circuitos.json):
// { nodos: [...], tierra?: 'G', elementos: [
//     { id, tipo: 'fuente', valor, pos, neg },          // V; pos = nodo del terminal +
//     { id, tipo: 'resistencia' | 'condensador', valor, a, b },     // Ω o F
//     { id, tipo: 'cable', a, b } ] }

import { z } from 'zod';
import { analizarGeometria, clave } from './geometria.js';

const id = z.string().min(1);

export const esquemaElemento = z.discriminatedUnion('tipo', [
  z.object({ id, tipo: z.literal('fuente'), valor: z.number().positive(), pos: id, neg: id }),
  z.object({ id, tipo: z.literal('resistencia'), valor: z.number().positive(), a: id, b: id }),
  z.object({ id, tipo: z.literal('condensador'), valor: z.number().positive(), a: id, b: id }),
  z.object({ id, tipo: z.literal('cable'), a: id, b: id }),
]);

export const esquemaNetlist = z.object({
  nodos: z.array(id).optional(),
  tierra: id.optional(),
  elementos: z.array(esquemaElemento).min(1),
});

export const extremos = (e) => (e.tipo === 'fuente' ? [e.pos, e.neg] : [e.a, e.b]);

/** Lista de nodos usada por los elementos (en orden de aparición). */
export function nodosDe(net) {
  const vistos = [];
  for (const e of net.elementos) for (const n of extremos(e)) if (!vistos.includes(n)) vistos.push(n);
  return vistos;
}

/** Valida y devuelve { ok, errores[], avisos[] }. */
export function validarNetlist(net) {
  const r = esquemaNetlist.safeParse(net);
  if (!r.success) {
    return { ok: false, errores: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`), avisos: [] };
  }
  const errores = [];
  const avisos = [];
  const ids = new Set();
  for (const e of net.elementos) {
    if (ids.has(e.id)) errores.push(`El nombre ${e.id} está repetido.`);
    ids.add(e.id);
    const [p, q] = extremos(e);
    if (p === q) avisos.push(`${e.id} tiene sus dos terminales en el mismo nodo (está en cortocircuito).`);
  }
  if (!net.elementos.some((e) => e.tipo === 'fuente')) errores.push('El circuito necesita al menos una fuente.');
  if (!net.elementos.some((e) => e.tipo === 'resistencia' || e.tipo === 'condensador')) errores.push('El circuito necesita al menos una resistencia o un condensador.');

  // Conectividad
  const nodos = nodosDe(net);
  const vecinos = new Map(nodos.map((n) => [n, new Set()]));
  for (const e of net.elementos) {
    const [p, q] = extremos(e);
    vecinos.get(p).add(q);
    vecinos.get(q).add(p);
  }
  const visto = new Set([nodos[0]]);
  const pila = [nodos[0]];
  while (pila.length) for (const v of vecinos.get(pila.pop())) if (!visto.has(v)) visto.add(v), pila.push(v);
  if (visto.size !== nodos.length) errores.push('El circuito tiene partes desconectadas entre sí.');

  // Terminales sueltos
  const grado = new Map(nodos.map((n) => [n, 0]));
  for (const e of net.elementos) for (const n of extremos(e)) grado.set(n, grado.get(n) + 1);
  for (const [n, g] of grado) if (g === 1) avisos.push(`El nodo ${n} solo toca un elemento: por esa rama no circula corriente.`);

  return { ok: errores.length === 0, errores, avisos };
}

/**
 * Convierte el documento del editor en netlist.
 * Devuelve { netlist, geo, avisos } donde geo guarda la relación punto → nodo para dibujar y hallar mallas.
 */
export function docANetlist(doc) {
  const g = analizarGeometria(doc);
  const avisos = [];

  // Clases de puntos conectados
  const clases = new Map(); // raíz → { puntos: [], etiquetas: [] }
  for (const k of g.uf.padre.keys()) {
    const r = g.uf.raiz(k);
    if (!clases.has(r)) clases.set(r, { puntos: [], etiquetas: [] });
    clases.get(r).puntos.push(k);
  }

  // Etiquetas: se pegan al nodo del punto donde están (terminal, extremo o sobre un cable)
  for (const et of doc.etiquetas ?? []) {
    const k = clave(et.x, et.y);
    if (g.uf.padre.has(k)) clases.get(g.uf.raiz(k)).etiquetas.push(et.texto.trim());
  }

  // Solo interesan las clases que tocan algún terminal
  const raicesConTerminal = new Set();
  for (const [, t] of g.terminalesPorComp) {
    raicesConTerminal.add(g.uf.raiz(clave(t.a.x, t.a.y)));
    raicesConTerminal.add(g.uf.raiz(clave(t.b.x, t.b.y)));
  }

  // Nombres: etiqueta si hay; si no, N1, N2… de arriba-izquierda hacia abajo-derecha
  const nombre = new Map();
  const usados = new Set();
  // Grado de cada punto (cuántos segmentos llegan): se prefiere la etiqueta puesta en una unión
  const gradoPunto = new Map();
  for (const s of g.segmentos) for (const p of [s.p, s.q]) gradoPunto.set(clave(p.x, p.y), (gradoPunto.get(clave(p.x, p.y)) ?? 0) + 1);
  const gradoEtiqueta = new Map();
  for (const et of doc.etiquetas ?? []) gradoEtiqueta.set(et.texto.trim(), Math.max(gradoEtiqueta.get(et.texto.trim()) ?? 0, gradoPunto.get(clave(et.x, et.y)) ?? 0));
  const lista = [...raicesConTerminal].map((r) => {
    const pts = clases.get(r).puntos.map((k) => k.split(',').map(Number));
    const minY = Math.min(...pts.map((p) => p[1]));
    const minX = Math.min(...pts.filter((p) => p[1] === minY).map((p) => p[0]));
    const etiquetas = [...new Set(clases.get(r).etiquetas)].sort((a, b) => (gradoEtiqueta.get(b) ?? 0) - (gradoEtiqueta.get(a) ?? 0) || a.localeCompare(b));
    return { r, minX, minY, etiquetas };
  });
  lista.sort((p, q) => p.minY - q.minY || p.minX - q.minX);
  for (const et of doc.etiquetas ?? []) {
    const k = clave(et.x, et.y);
    if (!g.uf.padre.has(k) || !raicesConTerminal.has(g.uf.raiz(k))) avisos.push(`La etiqueta "${et.texto}" no está sobre ningún cable ni terminal.`);
  }
  for (const n of lista) {
    if (n.etiquetas.length) {
      const libre = n.etiquetas.find((e) => !usados.has(e));
      if (libre) {
        nombre.set(n.r, libre);
        usados.add(libre);
      }
    }
  }
  let i = 1;
  for (const n of lista) {
    if (nombre.has(n.r)) continue;
    while (usados.has(`N${i}`)) i++;
    nombre.set(n.r, `N${i}`);
    usados.add(`N${i}`);
  }

  const nodoDe = (p) => nombre.get(g.uf.raiz(clave(p.x, p.y)));
  const elementos = [];
  for (const c of doc.componentes ?? []) {
    const t = g.terminalesPorComp.get(c.id);
    if (c.tipo === 'fuente') elementos.push({ id: c.id, tipo: 'fuente', valor: c.valor, pos: nodoDe(t.b), neg: nodoDe(t.a) });
    else elementos.push({ id: c.id, tipo: c.tipo, valor: c.valor, a: nodoDe(t.a), b: nodoDe(t.b) });
  }

  for (const c of g.cortes) {
    const a = nodoDe(c.p);
    const b = nodoDe(c.q);
    if (a && b && a !== b) elementos.push({ id: c.id, tipo: 'cable', a, b });
  }

  const fuente = elementos.find((e) => e.tipo === 'fuente');
  const netlist = { nodos: [...new Set(nombre.values())], tierra: fuente?.neg, elementos };

  // Posición representativa de cada nodo (para orientar mallas de respaldo)
  const posNodo = {};
  for (const [r, n] of nombre) {
    const pts = clases.get(r).puntos.map((k) => k.split(',').map(Number));
    posNodo[n] = { x: pts.reduce((s, p) => s + p[0], 0) / pts.length, y: pts.reduce((s, p) => s + p[1], 0) / pts.length };
  }

  const esquinaNodo = Object.fromEntries(lista.filter((x) => nombre.has(x.r)).map((x) => [nombre.get(x.r), { x: x.minX, y: x.minY }]));
  const cablesRama = g.cortes.map((c) => ({ id: c.id, p: c.p, q: c.q }));

  const etiquetaPunto = new Map((doc.etiquetas ?? []).map((e) => [clave(e.x, e.y), e.texto.trim()]));
  const etiquetasPorNodo = {};
  for (const [r, nom] of nombre) etiquetasPorNodo[nom] = [...new Set(clases.get(r).etiquetas)].sort();
  return { netlist, geo: { ...g, nodoDe, posNodo, esquinaNodo, cablesRama, etiquetaPunto, etiquetasPorNodo }, avisos };
}

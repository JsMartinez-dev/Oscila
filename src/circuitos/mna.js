// Análisis nodal modificado (MNA). Es el verificador numérico de todas las soluciones que se muestran.
//
// - Solo resistencias: conductancias G = 1/R.
// - Solo condensadores (inicialmente descargados): el mismo planteamiento con C en lugar de G
//   (conservación de la carga en cada nodo interno); la "corriente" de la fuente es la carga entregada.
// - Resistencias y condensadores en DC: estado estacionario, los condensadores son circuito abierto.
//   Los nodos que quedan unidos solo por condensadores se resuelven después por conservación de carga.

import { resolverLineal, SistemaSingular } from './lineal.js';
import { extremos, nodosDe, validarNetlist } from './netlist.js';

/** Resuelve un sistema nodal con nodos de potencial conocido. */
function nodal({ nodos, conocidos, ramas, fuentes }) {
  const incog = nodos.filter((n) => !(n in conocidos));
  const iv = new Map(incog.map((n, i) => [n, i]));
  const nv = incog.length;
  const N = nv + fuentes.length;
  const A = Array.from({ length: N }, () => new Array(N).fill(0));
  const b = new Array(N).fill(0);

  for (const { a, b: q, y } of ramas) {
    for (const [p, o] of [[a, q], [q, a]]) {
      if (!iv.has(p)) continue;
      const f = iv.get(p);
      A[f][f] += y;
      if (iv.has(o)) A[f][iv.get(o)] -= y;
      else b[f] += y * conocidos[o];
    }
  }
  fuentes.forEach((fu, k) => {
    const col = nv + k;
    // J = corriente que sale por el + hacia el circuito
    if (iv.has(fu.pos)) A[iv.get(fu.pos)][col] -= 1;
    if (iv.has(fu.neg)) A[iv.get(fu.neg)][col] += 1;
    // V(pos) − V(neg) = ε
    const f = col;
    if (iv.has(fu.pos)) A[f][iv.get(fu.pos)] += 1;
    else b[f] -= conocidos[fu.pos];
    if (iv.has(fu.neg)) A[f][iv.get(fu.neg)] -= 1;
    else b[f] += conocidos[fu.neg];
    b[f] += fu.valor;
  });

  const x = N ? resolverLineal(A, b) : [];
  const V = { ...conocidos };
  incog.forEach((n, i) => (V[n] = x[i]));
  const J = Object.fromEntries(fuentes.map((fu, k) => [fu.id, x[nv + k]]));
  return { V, J };
}

function componentes(nodos, aristas) {
  const vec = new Map(nodos.map((n) => [n, []]));
  for (const [p, q] of aristas) {
    vec.get(p)?.push(q);
    vec.get(q)?.push(p);
  }
  const comp = new Map();
  let c = 0;
  for (const n of nodos) {
    if (comp.has(n)) continue;
    const pila = [n];
    comp.set(n, c);
    while (pila.length) for (const v of vec.get(pila.pop())) if (!comp.has(v)) comp.set(v, c), pila.push(v);
    c++;
  }
  return comp;
}

export function resolverCircuito(net) {
  const val = validarNetlist(net);
  if (!val.ok) return { ok: false, error: val.errores.join(' '), avisos: val.avisos };

  const nodos = nodosDe(net);
  const fuentes = net.elementos.filter((e) => e.tipo === 'fuente');
  const Rs = net.elementos.filter((e) => e.tipo === 'resistencia');
  const Cs = net.elementos.filter((e) => e.tipo === 'condensador');
  const cables = net.elementos.filter((e) => e.tipo === 'cable');
  const fuentesYCables = [...fuentes, ...cables.map((c) => ({ id: c.id, pos: c.a, neg: c.b, valor: 0 }))];
  const tierra = net.tierra && nodos.includes(net.tierra) ? net.tierra : fuentes[0].neg;
  const modo = Rs.length && Cs.length ? 'RC' : Rs.length ? 'R' : 'C';

  let V;
  let J;
  try {
    if (modo === 'C') {
      ({ V, J } = nodal({ nodos, conocidos: { [tierra]: 0 }, ramas: Cs.map((c) => ({ a: c.a, b: c.b, y: c.valor })), fuentes: fuentesYCables }));
    } else {
      // Fase A: parte unida por resistencias y fuentes
      const aristasA = [...Rs, ...fuentes, ...cables].map(extremos);
      const comp = componentes(nodos, aristasA);
      const cT = comp.get(tierra);
      const nodosA = nodos.filter((n) => comp.get(n) === cT);
      const fuentesA = fuentesYCables.filter((f) => comp.get(f.pos) === cT);
      if (fuentes.some((f) => comp.get(f.pos) !== cT)) {
        return { ok: false, error: 'Hay una fuente unida al resto solo por condensadores; ese caso no está soportado.', avisos: val.avisos };
      }
      ({ V, J } = nodal({
        nodos: nodosA,
        conocidos: { [tierra]: 0 },
        ramas: Rs.filter((r) => comp.get(r.a) === cT).map((r) => ({ a: r.a, b: r.b, y: 1 / r.valor })),
        fuentes: fuentesA,
      }));

      // Fase B: nodos unidos solo por condensadores (los grupos unidos por R sin corriente son un supernodo)
      const resto = nodos.filter((n) => !(n in V));
      if (resto.length) {
        const compR = componentes(resto, Rs.filter((r) => resto.includes(r.a) && resto.includes(r.b)).map(extremos));
        const sup = (n) => (n in V ? n : `__s${compR.get(n)}`);
        const supernodos = [...new Set(resto.map(sup))];
        const r = nodal({
          nodos: [...supernodos, ...Object.keys(V)],
          conocidos: V,
          ramas: Cs.map((c) => ({ a: sup(c.a), b: sup(c.b), y: c.valor })).filter((x) => x.a !== x.b),
          fuentes: [],
        });
        for (const n of resto) V[n] = r.V[sup(n)];
      }
    }
  } catch (e) {
    if (e instanceof SistemaSingular) {
      return { ok: false, error: 'El circuito no tiene solución única (por ejemplo, fuentes en paralelo o un lazo formado solo por fuentes).', avisos: val.avisos };
    }
    throw e;
  }

  const porElemento = {};
  for (const e of net.elementos) {
    if (e.tipo === 'resistencia') {
      const vab = V[e.a] - V[e.b];
      const I = vab / e.valor;
      porElemento[e.id] = { tipo: e.tipo, I, Vab: vab, V: Math.abs(vab), P: I * I * e.valor };
    } else if (e.tipo === 'condensador') {
      const vab = V[e.a] - V[e.b];
      porElemento[e.id] = { tipo: e.tipo, Vab: vab, V: Math.abs(vab), Q: e.valor * Math.abs(vab), U: 0.5 * e.valor * vab * vab };
    } else if (e.tipo === 'cable') {
      porElemento[e.id] = { tipo: e.tipo, I: modo === 'C' ? 0 : -(J[e.id] ?? 0), Q: modo === 'C' ? -(J[e.id] ?? 0) : 0 };
    } else if (modo === 'C') {
      const Q = J[e.id];
      porElemento[e.id] = { tipo: e.tipo, Q, U: e.valor * Q, rol: Q >= 0 ? 'entrega' : 'absorbe' };
    } else {
      const I = J[e.id];
      porElemento[e.id] = { tipo: e.tipo, I, P: e.valor * I, rol: I >= 0 ? 'entrega' : 'absorbe' };
    }
  }

  const resultado = { ok: true, modo, tierra, potenciales: V, porElemento, avisos: val.avisos };
  if (fuentes.length === 1) {
    const f = fuentes[0];
    const pf = porElemento[f.id];
    if (modo === 'C') resultado.equivalente = { Ceq: pf.Q / f.valor, Q: pf.Q, U: 0.5 * pf.Q * f.valor };
    else if (Math.abs(pf.I) > 1e-15) resultado.equivalente = { Req: f.valor / pf.I, I: pf.I, P: pf.P };
  }
  return resultado;
}

// Reducción serie/paralelo de la red pasiva vista desde los bornes de una única fuente.
//
// Cada "arista" es una resistencia (o condensador) original o una combinación:
//   { id, nombre (LaTeX), valor, a, b, tipo: 'hoja'|'serie'|'paralelo', hijos: [aristas], elemento? }
// Cada paso agrupa las combinaciones de un mismo tipo hechas a la vez ("Circuito 2", "Circuito 3", …).

import { nombreLatex, subindice } from './formato.js';

const combinarValor = (tipoRed, tipoComb, valores) => {
  const suma = (arr) => arr.reduce((s, v) => s + v, 0);
  const inv = (arr) => 1 / suma(arr.map((v) => 1 / v));
  // Resistencias: serie suma, paralelo inversos. Condensadores: al revés.
  if (tipoRed === 'R') return tipoComb === 'serie' ? suma(valores) : inv(valores);
  return tipoComb === 'serie' ? inv(valores) : suma(valores);
};

function crearNombrador(tipoRed, usados) {
  const L = tipoRed === 'R' ? 'R' : 'C';
  let letra = 0;
  return (hijos) => {
    const subs = hijos.map((h) => subindice(h.nombre)).join('');
    if (subs && subs.length <= 4 && hijos.every((h) => /^[0-9a-z]*$/.test(subindice(h.nombre))) && !usados.has(subs)) {
      usados.add(subs);
      return `${L}_{${subs}}`;
    }
    let s;
    do s = String.fromCharCode(65 + letra++);
    while (usados.has(s));
    usados.add(s);
    return `${L}_{${s}}`;
  };
}

/**
 * Reduce la red. Devuelve { ok, motivo, tipoRed, fuente, s, t, pasos, raiz, sinCorriente, original }.
 * pasos[k] = { tipo: 'serie'|'paralelo', combinaciones: [{ resultado, hijos }], circuito: aristas después del paso }
 */
export function reducir(net) {
  const fuentes = net.elementos.filter((e) => e.tipo === 'fuente');
  if (fuentes.length !== 1) return { ok: false, motivo: 'varias-fuentes' };
  const fuente = fuentes[0];
  const hayR = net.elementos.some((e) => e.tipo === 'resistencia');
  const tipoRed = hayR ? 'R' : 'C';
  const tipoElem = hayR ? 'resistencia' : 'condensador';
  const s = fuente.pos;
  const t = fuente.neg;

  const usados = new Set();
  let aristas = net.elementos
    .filter((e) => e.tipo === tipoElem)
    .map((e) => {
      const nombre = nombreLatex(e.id, e.tipo);
      usados.add(subindice(nombre));
      return { id: e.id, nombre, valor: e.valor, a: e.a, b: e.b, tipo: 'hoja', hijos: [], elemento: e };
    });
  const original = [...aristas];
  const nombrar = crearNombrador(tipoRed, usados);
  const sinCorriente = [];
  let contador = 0;

  const podar = () => {
    let cambio = true;
    while (cambio) {
      cambio = false;
      const lazos = aristas.filter((x) => x.a === x.b);
      if (lazos.length) {
        sinCorriente.push(...lazos);
        aristas = aristas.filter((x) => x.a !== x.b);
        cambio = true;
      }
      const grado = new Map();
      for (const x of aristas) for (const v of [x.a, x.b]) grado.set(v, (grado.get(v) ?? 0) + 1);
      const colgantes = aristas.filter((x) => [x.a, x.b].some((v) => v !== s && v !== t && grado.get(v) === 1));
      if (colgantes.length) {
        sinCorriente.push(...colgantes);
        aristas = aristas.filter((x) => !colgantes.includes(x));
        cambio = true;
      }
    }
  };

  const nueva = (tipo, hijos, a, b) => ({
    id: `__${++contador}`,
    nombre: nombrar(hijos),
    valor: combinarValor(tipoRed, tipo, hijos.map((h) => h.valor)),
    a,
    b,
    tipo,
    hijos,
  });

  const buscarSeries = () => {
    const incid = new Map();
    for (const x of aristas) for (const v of [x.a, x.b]) incid.set(v, [...(incid.get(v) ?? []), x]);
    const interno = (v) => {
      if (v === s || v === t) return false;
      const ar = incid.get(v) ?? [];
      if (ar.length !== 2 || ar[0] === ar[1]) return false;
      const otro = (x) => (x.a === v ? x.b : x.a);
      return otro(ar[0]) !== otro(ar[1]); // dos aristas al mismo vecino son un paralelo, no una serie
    };
    const visitadas = new Set();
    const cadenas = [];
    for (const v of incid.keys()) {
      if (!interno(v)) continue;
      const [x0] = incid.get(v);
      if (visitadas.has(x0)) continue;
      // Ir hacia un extremo de la cadena
      let actual = v;
      let arista = incid.get(v)[0];
      for (;;) {
        const sig = arista.a === actual ? arista.b : arista.a;
        if (!interno(sig) || sig === v) {
          actual = sig;
          break;
        }
        arista = incid.get(sig).find((y) => y !== arista);
        actual = sig;
      }
      // Recorrer la cadena completa desde ese extremo
      const inicio = actual;
      const lista = [];
      let nodo = inicio;
      let ar = arista;
      for (;;) {
        lista.push(ar);
        visitadas.add(ar);
        const sig = ar.a === nodo ? ar.b : ar.a;
        if (!interno(sig) || lista.length > aristas.length) {
          nodo = sig;
          break;
        }
        ar = incid.get(sig).find((y) => y !== ar);
        nodo = sig;
      }
      if (lista.length >= 2) cadenas.push({ hijos: lista, a: inicio, b: nodo });
    }
    return cadenas;
  };

  const buscarParalelos = () => {
    const grupos = new Map();
    for (const x of aristas) {
      const k = [x.a, x.b].sort().join('\u0000');
      grupos.set(k, [...(grupos.get(k) ?? []), x]);
    }
    return [...grupos.values()].filter((g) => g.length >= 2).map((g) => ({ hijos: g, a: g[0].a, b: g[0].b }));
  };

  podar();
  const pasos = [];
  for (let guarda = 0; guarda < 100; guarda++) {
    if (aristas.length === 1 && [aristas[0].a, aristas[0].b].sort().join() === [s, t].sort().join()) {
      return { ok: true, tipoRed, fuente, s, t, pasos, raiz: aristas[0], sinCorriente, original };
    }
    if (aristas.length === 0) return { ok: false, motivo: 'sin-camino', tipoRed, fuente };
    let tipo = 'serie';
    let combos = buscarSeries();
    if (!combos.length) {
      tipo = 'paralelo';
      combos = buscarParalelos();
    }
    if (!combos.length) return { ok: false, motivo: 'puente', tipoRed, fuente, pasos, circuito: aristas };
    const combinaciones = [];
    for (const c of combos) {
      const r = nueva(tipo, c.hijos, c.a, c.b);
      combinaciones.push({ resultado: r, hijos: c.hijos });
      aristas = aristas.filter((x) => !c.hijos.includes(x)).concat(r);
    }
    podar();
    pasos.push({ tipo, combinaciones, circuito: [...aristas] });
  }
  return { ok: false, motivo: 'puente', tipoRed, fuente };
}

/**
 * Regresa por el árbol: asigna a cada arista su voltaje V y su corriente I (o carga Q).
 * Devuelve un Map id → { V, I } para R o { V, Q } para C.
 */
export function regresar(red) {
  const { tipoRed, fuente, raiz } = red;
  const val = new Map();
  const V0 = fuente.valor;
  if (tipoRed === 'R') val.set(raiz.id, { V: V0, I: V0 / raiz.valor });
  else val.set(raiz.id, { V: V0, Q: raiz.valor * V0 });

  const bajar = (x) => {
    const p = val.get(x.id);
    for (const h of x.hijos) {
      if (tipoRed === 'R') {
        if (x.tipo === 'serie') val.set(h.id, { I: p.I, V: p.I * h.valor });
        else val.set(h.id, { V: p.V, I: p.V / h.valor });
      } else if (x.tipo === 'serie') val.set(h.id, { Q: p.Q, V: p.Q / h.valor });
      else val.set(h.id, { V: p.V, Q: h.valor * p.V });
      bajar(h);
    }
  };
  bajar(raiz);
  for (const x of red.sinCorriente) {
    const marcar = (y) => {
      val.set(y.id, tipoRed === 'R' ? { V: 0, I: 0 } : { V: 0, Q: 0 });
      y.hijos.forEach(marcar);
    };
    marcar(x);
  }
  return val;
}

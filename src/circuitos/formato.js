// Formato de números y cantidades en LaTeX, con el estilo del PDF de ejercicios resueltos (3 cifras significativas).

import { conPrefijo } from './unidades.js';

const LATEX_UNIDAD = {
  'Ω': '\\Omega',
  'Ω^{-1}': '\\Omega^{-1}',
  A: '\\mathrm{A}',
  V: '\\mathrm{V}',
  W: '\\mathrm{W}',
  F: '\\mathrm{F}',
  C: '\\mathrm{C}',
  J: '\\mathrm{J}',
};

/** Número en LaTeX con `cifras` cifras significativas: 0.846, 13.8, 2880, 1.29\times10^{-5}. */
export function n(x, cifras = 3) {
  if (!Number.isFinite(x)) return '\\text{—}';
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e-3 && abs < 1e5) {
    const s = x.toPrecision(cifras);
    if (!s.includes('e')) return s;
    return String(Number(s)); // 2.88e+3 → 2880
  }
  const [m, e] = x.toExponential(cifras - 1).split('e');
  return `${m}\\times10^{${Number(e)}}`;
}

/** Cantidad con unidad: q(1.93, 'A') → "1.93\,\mathrm{A}". */
export function q(x, unidad, cifras = 3) {
  return `${n(x, cifras)}\\,${LATEX_UNIDAD[unidad] ?? `\\mathrm{${unidad}}`}`;
}

/** Cantidad con prefijo SI: qp(1.29e-5, 'F') → "12.9\,\mu\mathrm{F}". */
export function qp(x, unidad, cifras = 3) {
  const { mantisa, prefijo } = conPrefijo(x);
  if (!prefijo) return q(x, unidad, cifras);
  const pre = prefijo === 'µ' ? '\\mu ' : `\\mathrm{${prefijo}}`;
  const u = unidad === 'Ω' ? '\\Omega' : `\\mathrm{${unidad}}`;
  return `${n(mantisa, cifras)}\\,${pre}${u}`;
}

/** Igual que q, pero si hay prefijo añade la forma con prefijo: "1.29\times10^{-5}\,F=12.9\,\mu F". */
export function qAmbas(x, unidad, cifras = 3) {
  const base = q(x, unidad, cifras);
  const { prefijo } = conPrefijo(x);
  return prefijo && prefijo !== 'k' ? `${base}=${qp(x, unidad, cifras)}` : base;
}

/** Nombre LaTeX de un elemento a partir de su id: R1 → R_{1}, C7 → C_{7}, E12 → \varepsilon_{12}. */
export function nombreLatex(id, tipo) {
  const m = String(id).match(/^([A-Za-z])(.*)$/);
  if (!m) return `\\text{${id}}`;
  const [, letra, resto] = m;
  const base = tipo === 'fuente' ? '\\varepsilon' : letra.toUpperCase();
  return resto ? `${base}_{${resto}}` : base;
}

/** Subíndice de un nombre LaTeX "R_{12}" → "12". */
export function subindice(nombre) {
  const m = nombre.match(/_\{([^}]*)\}$/);
  return m ? m[1] : '';
}

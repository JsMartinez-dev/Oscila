// Resolución de sistemas lineales mostrando cada paso.
//   ≤ 3 incógnitas: sustitución (despejar, sustituir, simplificar, retrosustituir).
//   ≥ 4 incógnitas: forma matricial y eliminación de Gauss con cada operación de fila.
// Una ecuación es { coef: { I_1: 8, I_2: 6 }, c: 4 }  ⇔  8 I_1 + 6 I_2 = 4.

import { SistemaSingular } from './lineal.js';

const EPS = 1e-12;

/** Coeficiente compacto: hasta 4 cifras significativas, sin ceros sobrantes. */
export function k(x) {
  if (Math.abs(x) < EPS) return '0';
  const r = Number(x.toPrecision(4));
  const abs = Math.abs(r);
  if (abs !== 0 && (abs < 1e-3 || abs >= 1e6)) {
    const [m, e] = r.toExponential(3).split('e');
    return `${Number(m)}\\times10^{${Number(e)}}`;
  }
  return String(r);
}

/** Término "+ 8I_1" / "- I_2" / "+0.5I_3" para encadenar. */
function termino(coef, variable, primero) {
  const signo = coef < 0 ? '-' : primero ? '' : '+';
  const abs = Math.abs(coef);
  const num = Math.abs(abs - 1) < EPS ? '' : k(abs);
  return `${signo}${num}${variable}`;
}

export function latexLado(coef, vars) {
  const ts = vars.filter((v) => Math.abs(coef[v] ?? 0) > EPS);
  if (!ts.length) return '0';
  return ts.map((v, i) => termino(coef[v], v, i === 0)).join('');
}

export function latexEcuacion(ec, vars) {
  return `${latexLado(ec.coef, vars)}=${k(ec.c)}`;
}

const limpiar = (ec) => {
  const coef = {};
  for (const [v, a] of Object.entries(ec.coef)) if (Math.abs(a) > EPS * 1e3 * Math.max(1, Math.abs(ec.c))) coef[v] = a;
  return { coef, c: ec.c };
};

/**
 * Resuelve el sistema registrando los pasos.
 * ecuaciones: [{ coef, c, tag }]  (tag = número con el que ya se mostró la ecuación)
 * vars: orden de las incógnitas (LaTeX, p. ej. 'I_1')
 * nuevoTag: () => número para cada ecuación nueva
 * Devuelve { solucion: { var: valor }, bloques: [...] }.
 */
export function resolverConPasos(ecuaciones, vars, nuevoTag) {
  if (vars.length <= 3) return porSustitucion(ecuaciones, vars, nuevoTag);
  return porGauss(ecuaciones, vars, nuevoTag);
}

function porSustitucion(ecuaciones, vars, nuevoTag) {
  const bloques = [{ tipo: 'texto', texto: 'Se resuelve el sistema por **sustitución**.' }];
  let restantes = ecuaciones.map((e) => ({ ...limpiar(e), tag: e.tag }));
  const despejes = []; // [{ v, ec }] para retrosustituir
  const solucion = {};

  while (restantes.length > 1) {
    // Ecuación con menos incógnitas; en ella, la incógnita con coeficiente más "limpio"
    restantes.sort((p, q) => Object.keys(p.coef).length - Object.keys(q.coef).length);
    const piv = restantes[0];
    const varsPiv = vars.filter((v) => v in piv.coef);
    if (!varsPiv.length) throw new SistemaSingular();
    // Preferir coeficiente 1; luego coeficiente positivo; luego el primero en orden
    const v =
      varsPiv.find((x) => Math.abs(piv.coef[x] - 1) < EPS) ??
      varsPiv.find((x) => piv.coef[x] > 0) ??
      varsPiv.find((x) => Math.abs(Math.abs(piv.coef[x]) - 1) < EPS) ??
      varsPiv[0];
    const a = piv.coef[v];
    const otras = varsPiv.filter((x) => x !== v);

    // x = (c − Σ b·y) / a
    let numerador = k(piv.c);
    for (const y of otras) numerador += termino(-piv.coef[y], y, false);
    const expr = otras.length === 0 ? k(piv.c / a) : Math.abs(a - 1) < EPS ? numerador : `\\dfrac{${numerador}}{${k(a)}}`;
    bloques.push({ tipo: 'ecuacion', latex: `\\text{De }(${piv.tag}):\\quad ${v}=${expr}` });
    despejes.push({ v, ec: piv, otras });

    const siguientes = [];
    for (const ec of restantes.slice(1)) {
      if (!(v in ec.coef)) {
        siguientes.push(ec);
        continue;
      }
      const f = ec.coef[v] / a;
      const nueva = { coef: { ...ec.coef }, c: ec.c - f * piv.c };
      delete nueva.coef[v];
      for (const y of otras) nueva.coef[y] = (nueva.coef[y] ?? 0) - f * piv.coef[y];
      const limpia = { ...limpiar(nueva), tag: nuevoTag() };
      // Mostrar la sustitución: el coeficiente de v por la expresión, más el resto de la ecuación
      const resto = vars.filter((y) => y !== v && Math.abs(ec.coef[y] ?? 0) > EPS);
      const coefV = ec.coef[v];
      const signoV = coefV < 0 ? '-' : '';
      const absV = Math.abs(coefV);
      const parte = `${signoV}${Math.abs(absV - 1) < EPS ? '' : k(absV)}\\left(${expr}\\right)`;
      const restoTxt = resto.map((y) => termino(ec.coef[y], y, false)).join('');
      bloques.push({
        tipo: 'ecuacion',
        latex: `\\text{En }(${ec.tag}):\\quad ${parte}${restoTxt}=${k(ec.c)}\\ \\Rightarrow\\ ${latexEcuacion(limpia, vars)}`,
        tag: limpia.tag,
      });
      siguientes.push(limpia);
    }
    restantes = siguientes;
  }

  // Última ecuación: una incógnita
  const ult = restantes[0];
  const varsUlt = vars.filter((v) => v in ult.coef);
  if (varsUlt.length !== 1) throw new SistemaSingular();
  const y = varsUlt[0];
  solucion[y] = ult.c / ult.coef[y];
  bloques.push({
    tipo: 'ecuacion',
    latex:
      Math.abs(ult.coef[y] - 1) < EPS
        ? `\\boxed{${y}=${k(solucion[y])}\\,\\mathrm{A}}`
        : `${y}=\\frac{${k(ult.c)}}{${k(ult.coef[y])}}\\ \\Rightarrow\\ \\boxed{${y}=${k(solucion[y])}\\,\\mathrm{A}}`,
  });

  // Retrosustitución
  for (const { v, ec, otras } of despejes.reverse()) {
    const sum = otras.reduce((s, o) => s + ec.coef[o] * solucion[o], 0);
    solucion[v] = (ec.c - sum) / ec.coef[v];
    const conNumeros = otras.map((o) => `${ec.coef[o] < 0 ? '+' : '-'}${k(Math.abs(ec.coef[o]))}(${k(solucion[o])})`).join('');
    const num = `${k(ec.c)}${conNumeros}`;
    const a = ec.coef[v];
    const expr = otras.length === 0 ? `\\frac{${k(ec.c)}}{${k(a)}}` : Math.abs(a - 1) < EPS ? num : `\\dfrac{${num}}{${k(a)}}`;
    bloques.push({ tipo: 'ecuacion', latex: `${v}=${expr}\\ \\Rightarrow\\ \\boxed{${v}=${k(solucion[v])}\\,\\mathrm{A}}` });
  }
  return { solucion, bloques };
}

function latexMatriz(M, vars) {
  const n = vars.length;
  const cols = `${'c'.repeat(n)}|c`;
  const filas = M.map((f) => f.map(k).join(' & ')).join(' \\\\ ');
  return `\\left[\\begin{array}{${cols}}${filas}\\end{array}\\right]`;
}

function porGauss(ecuaciones, vars, nuevoTag) {
  const n = vars.length;
  const bloques = [{ tipo: 'texto', texto: `Con ${n} incógnitas se escribe el sistema en forma matricial $A\\,\\mathbf{I}=\\mathbf{b}$ y se aplica **eliminación de Gauss**.` }];
  const M = ecuaciones.map((e) => [...vars.map((v) => e.coef[v] ?? 0), e.c]);
  const A = `\\begin{bmatrix}${M.map((f) => f.slice(0, n).map(k).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
  const I = `\\begin{bmatrix}${vars.join(' \\\\ ')}\\end{bmatrix}`;
  const b = `\\begin{bmatrix}${M.map((f) => k(f[n])).join(' \\\\ ')}\\end{bmatrix}`;
  bloques.push({ tipo: 'ecuacion', latex: `${A}${I}=${b}` });
  bloques.push({ tipo: 'texto', texto: 'Matriz aumentada (cada fila es una de las ecuaciones anteriores, en orden):' });
  bloques.push({ tipo: 'ecuacion', latex: latexMatriz(M, vars) });

  for (let col = 0; col < n; col++) {
    const ops = [];
    if (Math.abs(M[col][col]) < EPS) {
      let f = col + 1;
      while (f < n && Math.abs(M[f][col]) < EPS) f++;
      if (f === n) throw new SistemaSingular();
      [M[col], M[f]] = [M[f], M[col]];
      ops.push(`R_{${col + 1}}\\leftrightarrow R_{${f + 1}}`);
    }
    for (let f = col + 1; f < n; f++) {
      const factor = M[f][col] / M[col][col];
      if (Math.abs(factor) < EPS) continue;
      for (let c = col; c <= n; c++) M[f][c] -= factor * M[col][c];
      M[f][col] = 0;
      ops.push(`R_{${f + 1}}\\leftarrow R_{${f + 1}}${factor < 0 ? '+' : '-'}${k(Math.abs(factor))}\\,R_{${col + 1}}`);
    }
    if (ops.length) {
      bloques.push({ tipo: 'texto', texto: `Columna ${col + 1} (pivote $${k(M[col][col])}$):` });
      bloques.push({ tipo: 'ecuacion', latex: `${ops.join(',\\quad ')}\\ \\Rightarrow\\ ${latexMatriz(M, vars)}` });
    }
  }
  if (Math.abs(M[n - 1][n - 1]) < EPS) throw new SistemaSingular();

  bloques.push({ tipo: 'texto', texto: 'Sustitución hacia atrás, desde la última fila:' });
  const x = new Array(n).fill(0);
  for (let f = n - 1; f >= 0; f--) {
    let s = M[f][n];
    let txt = k(M[f][n]);
    for (let c = f + 1; c < n; c++) {
      if (Math.abs(M[f][c]) < EPS) continue;
      s -= M[f][c] * x[c];
      txt += `${M[f][c] < 0 ? '+' : '-'}${k(Math.abs(M[f][c]))}(${k(x[c])})`;
    }
    x[f] = s / M[f][f];
    bloques.push({ tipo: 'ecuacion', latex: `${vars[f]}=\\dfrac{${txt}}{${k(M[f][f])}}\\ \\Rightarrow\\ \\boxed{${vars[f]}=${k(x[f])}\\,\\mathrm{A}}`, tag: nuevoTag() });
  }
  return { solucion: Object.fromEntries(vars.map((v, i) => [v, x[i]])), bloques };
}

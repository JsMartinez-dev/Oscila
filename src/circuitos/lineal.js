// Resolución numérica de A·x = b por eliminación gaussiana con pivoteo parcial.

export class SistemaSingular extends Error {
  constructor(mensaje = 'El sistema de ecuaciones no tiene solución única.') {
    super(mensaje);
    this.name = 'SistemaSingular';
  }
}

export function resolverLineal(A, b) {
  const n = b.length;
  const M = A.map((fila, i) => [...fila, b[i]]);
  const escala = Math.max(1e-300, ...A.flat().map(Math.abs));

  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let f = col + 1; f < n; f++) if (Math.abs(M[f][col]) > Math.abs(M[piv][col])) piv = f;
    if (Math.abs(M[piv][col]) < 1e-12 * escala) throw new SistemaSingular();
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let f = col + 1; f < n; f++) {
      const k = M[f][col] / M[col][col];
      if (k === 0) continue;
      for (let c = col; c <= n; c++) M[f][c] -= k * M[col][c];
    }
  }

  const x = new Array(n).fill(0);
  for (let f = n - 1; f >= 0; f--) {
    let s = M[f][n];
    for (let c = f + 1; c < n; c++) s -= M[f][c] * x[c];
    x[f] = s / M[f][f];
  }
  return x;
}

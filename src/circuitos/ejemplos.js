// Circuitos de ejemplo en formato del editor (los del paquete de ejercicios).

import { formatearValor } from './unidades.js';

let nCable = 0;
const comp = (id, tipo, x, y, rot, valor) => ({ id, tipo, x, y, rot, valor, texto: formatearValor(valor, tipo) });
const w = (x1, y1, x2, y2) => ({ id: `w${++nCable}`, x1, y1, x2, y2 });
const et = (texto, x, y) => ({ id: `e_${texto}`, texto, x, y });

/** Une una lista de puntos con cables consecutivos. */
const ruta = (...pts) => pts.slice(1).map((p, i) => w(pts[i][0], pts[i][1], p[0], p[1]));

// curso: corrientes de la solución del curso (paquete_EyM/casos/casos_prueba_circuitos.json), en A:
//   resistencia → I de a hacia b; fuente → I que sale por el +. Las orientaciones a/b y +/− del dibujo
//   coinciden con las del JSON, así que los signos se copian tal cual.

// Ejercicio 11: dos ramas en paralelo (1+3 y 7+5) con fuente de 48 V
export const DOC_EJ11 = {
  componentes: [
    comp('E', 'fuente', 0, 10, 270, 48),
    comp('R1', 'resistencia', 10, 1, 90, 1),
    comp('R2', 'resistencia', 10, 7, 90, 3),
    comp('R3', 'resistencia', 20, 1, 90, 7),
    comp('R4', 'resistencia', 20, 7, 90, 5),
  ],
  cables: [...ruta([0, 6], [0, 0], [20, 0], [20, 1]), w(10, 0, 10, 1), w(10, 5, 10, 7), w(20, 5, 20, 7), ...ruta([0, 10], [0, 12], [20, 12], [20, 11]), w(10, 11, 10, 12)],
  nodos: [],
  etiquetas: [et('A', 0, 0), et('B', 0, 12)],
  curso: { ejercicio: 11, corrientes: { E: 16, R1: 12, R2: 12, R3: 4, R4: 4 } },
};

// Ejercicio 12: R1 en serie con R2 ∥ R3 ∥ R4, fuente de 50 V
export const DOC_EJ12 = {
  componentes: [
    comp('E', 'fuente', 0, 10, 270, 50),
    comp('R1', 'resistencia', 3, 0, 0, 100),
    comp('R2', 'resistencia', 10, 3, 90, 50),
    comp('R3', 'resistencia', 16, 3, 90, 200),
    comp('R4', 'resistencia', 22, 3, 90, 200),
  ],
  cables: [...ruta([0, 6], [0, 0], [3, 0]), ...ruta([7, 0], [22, 0], [22, 3]), w(10, 0, 10, 3), w(16, 0, 16, 3), ...ruta([0, 10], [0, 12], [22, 12], [22, 7]), w(10, 7, 10, 12), w(16, 7, 16, 12)],
  nodos: [],
  etiquetas: [],
  curso: { ejercicio: 12, corrientes: { E: 0.375, R1: 0.375, R2: 0.25, R3: 0.0625, R4: 0.0625 } },
};

// Ejercicio 13: fuente de 25 V (+ hacia b) en serie con 10 Ω; a y b en el camino externo
export const DOC_EJ13 = {
  componentes: [
    comp('R10s', 'resistencia', 10, 0, 0, 10),
    comp('E', 'fuente', 18, 0, 0, 25),
    comp('R10', 'resistencia', 14, 6, 0, 10),
    comp('R5i', 'resistencia', 14, 11, 0, 5),
    comp('R5e', 'resistencia', 0, 8, 90, 5),
    comp('R20', 'resistencia', 32, 12, 270, 20),
  ],
  cables: [
    ...ruta([8, 6], [8, 0], [10, 0]),
    w(14, 0, 18, 0),
    ...ruta([22, 0], [24, 0], [24, 6]),
    ...ruta([0, 8], [0, 6], [14, 6]),
    ...ruta([18, 6], [32, 6], [32, 8]),
    ...ruta([8, 6], [8, 11], [14, 11]),
    ...ruta([18, 11], [24, 11], [24, 6]),
    ...ruta([0, 12], [0, 16], [32, 16], [32, 12]),
  ],
  nodos: [],
  etiquetas: [et('a', 4, 6), et('b', 28, 6)],
  curso: { ejercicio: 13, corrientes: { R10s: 1.9318, E: 1.9318, R10: -0.5682, R5i: -1.1364, R5e: -0.2273, R20: -0.2273 } },
};

// Ejercicio 14: dos fuentes, tres ramas (figura del PDF)
export const DOC_EJ14 = {
  componentes: [
    comp('R8', 'resistencia', 0, 6, 90, 8),
    comp('R5', 'resistencia', 10, 5, 270, 5),
    comp('R1c', 'resistencia', 10, 10, 270, 1),
    comp('E4', 'fuente', 10, 15, 270, 4),
    comp('R3', 'resistencia', 17, 0, 180, 3),
    comp('R1d', 'resistencia', 20, 7, 270, 1),
    comp('E12', 'fuente', 20, 15, 270, 12),
  ],
  cables: [
    ...ruta([0, 6], [0, 0], [13, 0]),
    ...ruta([17, 0], [20, 0], [20, 3]),
    w(10, 0, 10, 1),
    w(10, 5, 10, 6),
    w(10, 10, 10, 11),
    w(20, 7, 20, 11),
    ...ruta([0, 10], [0, 16], [20, 16], [20, 15]),
    w(10, 15, 10, 16),
  ],
  nodos: [],
  etiquetas: [et('a', 0, 0), et('b', 10, 0), et('c', 20, 0), et('d', 20, 16), et('e', 10, 16), et('f', 0, 16)],
  curso: { ejercicio: 14, corrientes: { R8: 0.8462, E4: -0.4615, R1c: -0.4615, R5: -0.4615, E12: 1.3077, R1d: 1.3077, R3: 1.3077 } },
};

// Ejercicio 14 dibujado con un cruce sin nodo (no plano): la rama central baja cruzando el cable inferior
export const DOC_EJ14_CRUCE = {
  ...DOC_EJ14,
  cables: [
    ...ruta([0, 6], [0, 0], [13, 0]),
    ...ruta([17, 0], [20, 0], [20, 3]),
    w(10, 0, 10, 1),
    w(10, 5, 10, 6),
    w(10, 10, 10, 11),
    w(20, 7, 20, 11),
    ...ruta([0, 10], [0, 16], [20, 16], [20, 15]),
    ...ruta([10, 15], [10, 18], [24, 18], [24, 16], [20, 16]),
  ],
  etiquetas: [],
};

// Ejercicio 15: tres fuentes, cinco corrientes con el cable b–c como rama (360 V con + abajo)
export const DOC_EJ15 = {
  componentes: [
    comp('R200', 'resistencia', 0, 6, 90, 200),
    comp('E40', 'fuente', 10, 5, 270, 40),
    comp('R80', 'resistencia', 10, 9, 90, 80),
    comp('E360', 'fuente', 20, 1, 90, 360),
    comp('R20', 'resistencia', 20, 9, 90, 20),
    comp('E80', 'fuente', 30, 5, 270, 80),
    comp('R70', 'resistencia', 30, 9, 90, 70),
  ],
  cables: [
    ...ruta([0, 6], [0, 0], [30, 0], [30, 1]),
    w(10, 0, 10, 1),
    w(20, 0, 20, 1),
    w(10, 5, 10, 9),
    w(20, 5, 20, 9),
    w(30, 5, 30, 9),
    ...ruta([0, 10], [0, 16], [30, 16], [30, 13]),
    w(10, 13, 10, 16),
    w(20, 13, 20, 16),
  ],
  nodos: [],
  etiquetas: [et('a', 0, 0), et('b', 10, 0), et('c', 20, 0), et('d', 30, 0), et('e', 30, 16), et('f', 20, 16), et('g', 10, 16), et('h', 0, 16)],
  ramasCable: [['b', 'c']],
  curso: {
    ejercicio: 15,
    corrientes: { R200: -1, E40: 3, R80: -3, E360: 8, R20: 8, E80: 4, R70: -4 },
    ramas: { R200: { k: 1, hacia: 'b' }, R80: { k: 2, hacia: 'f' }, Wbc: { k: 3, hacia: 'c' }, E80: { k: 4, hacia: 'f' }, R20: { k: 5, hacia: 'f' } },
  },
};

// Ejercicio 9: red de 4 condensadores (C4, C7+C5, C6 en paralelo entre a y b) con 10 V
export const DOC_EJ9 = {
  componentes: [
    comp('E', 'fuente', 0, 10, 270, 10),
    comp('C4', 'condensador', 8, 3, 90, 4e-6),
    comp('C7', 'condensador', 14, 1, 90, 7e-6),
    comp('C5', 'condensador', 14, 7, 90, 5e-6),
    comp('C6', 'condensador', 20, 3, 90, 6e-6),
  ],
  cables: [
    ...ruta([0, 6], [0, 0], [20, 0], [20, 3]),
    w(8, 0, 8, 3),
    w(14, 0, 14, 1),
    w(14, 5, 14, 7),
    ...ruta([0, 10], [0, 12], [20, 12], [20, 7]),
    w(8, 7, 8, 12),
    w(14, 11, 14, 12),
  ],
  nodos: [],
  etiquetas: [et('a', 0, 0), et('b', 0, 12)],
};

export const EJEMPLOS = [
  { id: 'ej11', titulo: 'Ej. 11 — Dos ramas en paralelo', doc: DOC_EJ11 },
  { id: 'ej12', titulo: 'Ej. 12 — R₁ con R₂ ∥ R₃ ∥ R₄', doc: DOC_EJ12 },
  { id: 'ej13', titulo: 'Ej. 13 — Red con fuente de 25 V', doc: DOC_EJ13 },
  { id: 'ej14', titulo: 'Ej. 14 — Dos fuentes, tres ramas', doc: DOC_EJ14 },
  { id: 'ej15', titulo: 'Ej. 15 — Tres fuentes, cinco corrientes', doc: DOC_EJ15 },
  { id: 'ej9', titulo: 'Ej. 9 — Red de 4 condensadores', doc: DOC_EJ9 },
];

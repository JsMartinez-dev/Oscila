import { describe, expect, it } from 'vitest';
import { parsearValor, formatearValor } from './unidades.js';
import { resolverConPasos } from './sistemas.js';
import { resolverLineal } from './lineal.js';

describe('unidades y prefijos', () => {
  const casos = [
    ['4.7k', 'resistencia', 4700],
    ['4,7 kΩ', 'resistencia', 4700],
    ['4.7 kohm', 'resistencia', 4700],
    ['2.2M', 'resistencia', 2.2e6],
    ['100', 'resistencia', 100],
    ['330 Ω', 'resistencia', 330],
    ['10µF', 'condensador', 10e-6],
    ['10 uF', 'condensador', 10e-6],
    ['10μF', 'condensador', 10e-6],
    ['100 nF', 'condensador', 100e-9],
    ['4.7 pF', 'condensador', 4.7e-12],
    ['2 mF', 'condensador', 2e-3],
    ['12 V', 'fuente', 12],
    ['500 mV', 'fuente', 0.5],
    ['1.5kV', 'fuente', 1500],
    ['1e-6 F', 'condensador', 1e-6],
  ];
  for (const [texto, tipo, valor] of casos) {
    it(`${texto} → ${valor}`, () => {
      const r = parsearValor(texto, tipo);
      expect(r.error).toBeUndefined();
      expect(r.valor).toBeCloseTo(valor, 15);
    });
  }

  it('rechaza unidades equivocadas, valores vacíos, cero y negativos', () => {
    expect(parsearValor('10 V', 'resistencia').error).toBeDefined();
    expect(parsearValor('5 F', 'fuente').error).toBeDefined();
    expect(parsearValor('', 'resistencia').error).toBeDefined();
    expect(parsearValor('0', 'resistencia').error).toBeDefined();
    expect(parsearValor('-3', 'fuente').error).toBeDefined();
    expect(parsearValor('abc', 'fuente').error).toBeDefined();
    expect(parsearValor('3 xF', 'condensador').error).toBeDefined();
  });

  it('formatea con prefijo', () => {
    expect(formatearValor(4700, 'resistencia')).toBe('4.7 kΩ');
    expect(formatearValor(1.2917e-5, 'condensador')).toBe('12.9 µF');
    expect(formatearValor(12, 'fuente')).toBe('12 V');
  });
});

describe('sistemas con pasos', () => {
  const generar = (n, semilla) => {
    let s = semilla;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) * 10 - 5;
    const vars = Array.from({ length: n }, (_, i) => `I_{${i + 1}}`);
    const A = vars.map((_, i) => vars.map((__, j) => Math.round(rnd()) + (i === j ? 12 : 0)));
    const b = vars.map(() => Math.round(rnd() * 3));
    const ecs = A.map((fila, i) => ({ coef: Object.fromEntries(vars.map((v, j) => [v, fila[j]]).filter(([, a]) => a !== 0)), c: b[i], tag: i + 1 }));
    return { vars, A, b, ecs };
  };

  for (const n of [1, 2, 3, 4, 5, 6]) {
    it(`${n} incógnita(s): coincide con la solución numérica y muestra cada paso`, () => {
      const { vars, A, b, ecs } = generar(n, 17 + n);
      let tag = n;
      const { solucion, bloques } = resolverConPasos(ecs, vars, () => ++tag);
      const x = resolverLineal(A, b);
      vars.forEach((v, i) => expect(solucion[v]).toBeCloseTo(x[i], 9));
      const texto = JSON.stringify(bloques);
      // cada incógnita termina en un recuadro
      for (const v of vars) expect(texto).toContain(`\\\\boxed{${v.replace(/\\/g, '\\\\')}=`);
      if (n <= 3) expect(texto).toContain('sustitución');
      else {
        expect(texto).toContain('eliminación de Gauss');
        expect(texto).toContain('\\\\leftarrow');
      }
    });
  }

  it('Ej. 14 por sustitución da I1 = 0.846, I2 = −0.462, I3 = 1.31', () => {
    const vars = ['I_{1}', 'I_{2}', 'I_{3}'];
    const ecs = [
      { coef: { 'I_{1}': -1, 'I_{2}': 1, 'I_{3}': 1 }, c: 0, tag: 1 },
      { coef: { 'I_{1}': 8, 'I_{2}': 6 }, c: 4, tag: 2 },
      { coef: { 'I_{2}': -6, 'I_{3}': 4 }, c: 8, tag: 3 },
    ];
    let tag = 3;
    const { solucion } = resolverConPasos(ecs, vars, () => ++tag);
    expect(solucion['I_{1}']).toBeCloseTo(0.846, 3);
    expect(solucion['I_{2}']).toBeCloseTo(-0.4615, 3);
    expect(solucion['I_{3}']).toBeCloseTo(1.3077, 3);
  });
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolverCircuito } from './mna.js';
import { clasificar } from './clasificacion.js';
import { resolverPasoAPaso } from './pasos.js';
import { docANetlist } from './netlist.js';
import { plantearKirchhoff, ecuacionesLineales } from './kirchhoff.js';
import { DOC_EJ14, DOC_EJ15, DOC_EJ14_CRUCE } from './ejemplos.js';

const datos = JSON.parse(readFileSync(resolve(process.cwd(), 'paquete_EyM/casos/casos_prueba_circuitos.json'), 'utf8'));
const caso = (n) => datos.casos.find((c) => c.ejercicio === n);

/** Tolerancia relativa del 1 % (absoluta de 1e-6 para valores ≈ 0). */
function cerca(real, esperado, etiqueta) {
  const tol = Math.max(0.01 * Math.abs(esperado), 1e-6);
  expect(Math.abs(real - esperado), `${etiqueta}: ${real} vs ${esperado}`).toBeLessThanOrEqual(tol);
}

function comprobarElementos(r, esperado) {
  for (const [id, e] of Object.entries(esperado.por_elemento ?? {})) {
    const m = r.porElemento[id];
    expect(m, id).toBeDefined();
    if ('I_de_a_hacia_b_A' in e) cerca(m.I, e.I_de_a_hacia_b_A, `I ${id}`);
    if ('V_A' in e) cerca(m.V, e.V_A, `V ${id}`);
    if ('I_sale_por_+_A' in e) cerca(m.I, e['I_sale_por_+_A'], `I+ ${id}`);
    if ('P_W' in e) cerca(m.P, e.P_W, `P ${id}`);
    if ('rol' in e) expect(m.rol, `rol ${id}`).toBe(e.rol);
    if ('V' in e) cerca(m.V, e.V, `V ${id}`);
    if ('Q' in e) cerca(m.Q, e.Q, `Q ${id}`);
    if ('U' in e) cerca(m.U, e.U, `U ${id}`);
  }
}

describe('casos_prueba_circuitos.json', () => {
  for (const c of datos.casos) {
    describe(`Ejercicio ${c.ejercicio}: ${c.descripcion}`, () => {
      const e = c.esperado;

      it('clasificación', () => {
        expect(clasificar(c).clasificacion).toBe(e.clasificacion);
      });

      it('potenciales, corrientes, voltajes y potencias (MNA)', () => {
        const r = resolverCircuito(c);
        expect(r.ok, r.error).toBe(true);
        for (const [nodo, V] of Object.entries(e.potenciales_V ?? {})) cerca(r.potenciales[nodo], V, `V(${nodo})`);
        comprobarElementos(r, e);
        if ('Req_ohm' in e) cerca(r.equivalente.Req, e.Req_ohm, 'Req');
        if ('I_fuente_A' in e) cerca(r.equivalente.I, e.I_fuente_A, 'I fuente');
        if ('P_fuente_W' in e) cerca(r.equivalente.P, e.P_fuente_W, 'P fuente');
        if ('Ceq_F' in e) cerca(r.equivalente.Ceq, e.Ceq_F, 'Ceq');
        if ('Q_total_C' in e) cerca(r.equivalente.Q, e.Q_total_C, 'Q total');
        if ('U_total_J' in e) cerca(r.equivalente.U, e.U_total_J, 'U total');
      });

      it('solución paso a paso verificada contra MNA', () => {
        const s = resolverPasoAPaso(c);
        expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
        expect(s.metodo).toBe(c.metodo_esperado.startsWith('kirchhoff') ? 'kirchhoff' : 'reduccion');
        const latex = JSON.stringify(s.bloques);
        expect(latex).toContain('\\\\boxed');
      });

      if (c.metodo_esperado.startsWith('reduccion') && !c.elementos.some((x) => x.tipo === 'condensador')) {
        it('también se puede resolver por Kirchhoff (opcional)', () => {
          const s = resolverPasoAPaso(c, { metodo: 'kirchhoff' });
          expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
          expect(s.metodo).toBe('kirchhoff');
        });
      }
    });
  }

  it('Ej. 13: V_a − V_b y corriente por a y b', () => {
    const c = caso(13);
    const r = resolverCircuito(c);
    cerca(r.potenciales.L - r.potenciales.R, c.esperado.V_a_menos_V_b_V, 'Va − Vb');
    cerca(Math.abs(r.porElemento.R5e.I), c.esperado.I_por_a_y_b_A, 'I por a y b');
  });

  it('Ej. 10: V_cd y energía de los tres condensadores más alejados', () => {
    const c = caso(10);
    const r = resolverCircuito(c);
    cerca(Math.abs(r.potenciales.c - r.potenciales.d), c.esperado.V_cd_V, 'Vcd');
    const U = ['C1e', 'C1f', 'C1g'].reduce((s, id) => s + r.porElemento[id].U, 0);
    cerca(U, c.esperado.U_tres_mas_alejados_J, 'U tres más alejados');
  });
});

describe('Mallas a partir del dibujo', () => {
  it('Ej. 14: dos ventanas en sentido horario, iguales a las del PDF', () => {
    const { netlist, geo } = docANetlist(DOC_EJ14);
    const pl = plantearKirchhoff(netlist, geo);
    expect(pl.origenMallas).toBe('dibujo');
    expect(pl.mallas).toHaveLength(2);
    expect(pl.principales).toEqual(['b', 'e']);
    expect(pl.ramas.map((r) => [r.variable, r.desde, r.hacia])).toEqual([
      ['I_{1}', 'b', 'e'],
      ['I_{2}', 'e', 'b'],
      ['I_{3}', 'e', 'b'],
    ]);
    expect(pl.mallas[0].ruta).toEqual(['a', 'b', 'e', 'f', 'a']);
    expect(pl.mallas[1].ruta).toEqual(['b', 'c', 'd', 'e', 'b']);
    // 8 I1 + 6 I2 = 4   y   −6 I2 + 4 I3 = 8  (ecuaciones (2) y (3) del PDF)
    const [nodo, m1, m2] = ecuacionesLineales(pl);
    expect(nodo).toEqual({ coef: { 'I_{1}': -1, 'I_{2}': 1, 'I_{3}': 1 }, c: 0 });
    expect(m1.coef['I_{1}']).toBeCloseTo(8);
    expect(m1.coef['I_{2}']).toBeCloseTo(6);
    expect(m1.c).toBeCloseTo(4);
    expect(m2.coef['I_{2}']).toBeCloseTo(-6);
    expect(m2.coef['I_{3}']).toBeCloseTo(4);
    expect(m2.c).toBeCloseTo(8);
  });

  it('Ej. 14 dibujado: resultados iguales al JSON', () => {
    const { netlist, geo } = docANetlist(DOC_EJ14);
    const s = resolverPasoAPaso(netlist, { doc: DOC_EJ14, geo });
    expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
    comprobarElementos(s.mna, caso(14).esperado);
  });

  it('Ej. 15: tres ventanas en horario y Gauss con 4 incógnitas', () => {
    const { netlist, geo } = docANetlist(DOC_EJ15);
    const pl = plantearKirchhoff(netlist, geo);
    expect(pl.origenMallas).toBe('dibujo');
    expect(pl.mallas).toHaveLength(3);
    expect(pl.mallas.map((m) => m.ruta)).toEqual([
      ['a', 'b', 'g', 'h', 'a'],
      ['b', 'c', 'f', 'g', 'b'],
      ['c', 'd', 'e', 'f', 'c'],
    ]);
    const s = resolverPasoAPaso(netlist, { doc: DOC_EJ15, geo });
    expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
    expect(JSON.stringify(s.bloques)).toContain('eliminación de Gauss');
    comprobarElementos(s.mna, caso(15).esperado);
  });

  it('dibujo con cruce sin nodo: usa lazos fundamentales y la solución sigue verificada', () => {
    const { netlist, geo } = docANetlist(DOC_EJ14_CRUCE);
    const pl = plantearKirchhoff(netlist, geo);
    expect(pl.origenMallas).toBe('lazos');
    expect(pl.mallas).toHaveLength(2);
    const s = resolverPasoAPaso(netlist, { doc: DOC_EJ14_CRUCE, geo });
    expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
    comprobarElementos(s.mna, caso(14).esperado);
  });
});

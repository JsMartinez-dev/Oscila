import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { esquemaReconocimiento, reconocimientoADoc, reconocimientoANetlist } from './reconocimiento.js';
import { docANetlist } from './netlist.js';
import { resolverCircuito } from './mna.js';
import { resolverPasoAPaso } from './pasos.js';
import { clasificar } from './clasificacion.js';

const datos = JSON.parse(readFileSync(resolve(process.cwd(), 'paquete_EyM/casos/casos_prueba_circuitos.json'), 'utf8'));
const leer = (n) => JSON.parse(readFileSync(resolve(process.cwd(), `src/contenido/fotos/ej${n}.json`), 'utf8'));

describe('ejemplos de foto guardados (modo sin internet)', () => {
  for (const n of [11, 12, 13, 14, 15]) {
    it(`Ej. ${n}: JSON válido, dibujo con la misma conectividad y mismos resultados`, () => {
      const v = esquemaReconocimiento.safeParse(leer(n));
      expect(v.success, JSON.stringify(v.error?.issues)).toBe(true);
      const { doc, ok } = reconocimientoADoc(v.data);
      expect(ok).toBe(true);
      const { netlist, geo } = docANetlist(doc);
      const caso = datos.casos.find((c) => c.ejercicio === n);
      expect(clasificar(netlist).clasificacion).toBe(caso.esperado.clasificacion);
      const m = resolverCircuito(netlist);
      for (const [id, e] of Object.entries(caso.esperado.por_elemento)) {
        if ('V_A' in e) expect(Math.abs(m.porElemento[id].V - e.V_A)).toBeLessThan(0.01 * e.V_A + 1e-6);
        if ('P_W' in e) expect(Math.abs(m.porElemento[id].P - e.P_W)).toBeLessThan(0.01 * Math.abs(e.P_W) + 1e-6);
      }
      const s = resolverPasoAPaso(netlist, { doc, geo });
      expect(s.ok, `${s.error} ${(s.fallas ?? []).join('; ')}`).toBe(true);
      expect(resolverCircuito(reconocimientoANetlist(v.data)).ok).toBe(true);
    });
  }

  it('rechaza un JSON con un nodo inexistente o una fuente sin polaridad', () => {
    const malo = {
      elementos: [{ id: 'E1', tipo: 'fuente', valor: 5, unidad: 'V', nodo_a: 'n1', nodo_b: 'n9', positivo: null, x: 0.1, y: 0.5, orientacion: 'vertical', confianza: 1, confianza_valor: 1 }],
      nodos: [{ id: 'n1', x: 0, y: 0 }, { id: 'n2', x: 1, y: 1 }],
    };
    const v = esquemaReconocimiento.safeParse(malo);
    expect(v.success).toBe(false);
    const msgs = v.error.issues.map((i) => i.message).join(' ');
    expect(msgs).toContain('n9');
    expect(msgs).toContain('+');
  });

  it('marca para revisar los elementos con confianza baja', () => {
    const { doc } = reconocimientoADoc(esquemaReconocimiento.parse(leer(15)));
    expect(doc.componentes.filter((c) => c.revisar).map((c) => c.id)).toEqual(['E360']);
  });
});

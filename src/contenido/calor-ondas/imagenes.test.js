import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { IMAGENES } from './imagenes.js';
import { EJERCICIOS } from './ejercicios.js';

const raiz = path.resolve(__dirname, '../../..');
const paginas = ['MarcoConceptual.jsx', 'Aplicaciones.jsx'].map((p) => fs.readFileSync(path.join(raiz, 'src/pages/calor-ondas', p), 'utf8'));

describe('imágenes de Calor y Ondas', () => {
  it.each(Object.entries(IMAGENES))('%s es local, existe y tiene crédito', (_, im) => {
    expect(im.src).not.toMatch(/^(https?:)?\/\//);
    expect(fs.existsSync(path.join(raiz, 'public', im.src))).toBe(true);
    expect(im.alt).toBeTruthy();
    const c = im.credito;
    expect(c.autor).toBeTruthy();
    if (c.tipo === 'commons') {
      expect(c.pagina).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(c.licencia).toMatch(/^(CC0|CC BY|CC BY-SA|Dominio público)/);
      if (c.licencia !== 'Dominio público') expect(c.licenciaUrl).toMatch(/^https:\/\/creativecommons\.org\//);
    } else {
      expect(['equipo', 'propia']).toContain(c.tipo);
    }
  });

  it('cada figura de las páginas y de los ejercicios existe en el inventario', () => {
    const ids = paginas.flatMap((t) => [...t.matchAll(/<Figura id="([^"]+)"/g)].map((m) => m[1]));
    ids.push(...EJERCICIOS.map((e) => e.boceto));
    expect(ids.length).toBeGreaterThan(20);
    for (const id of ids) expect(IMAGENES[id], id).toBeDefined();
  });

  it('las páginas no cargan nada remoto ni usan MathJax', () => {
    for (const t of paginas) {
      expect(t).not.toMatch(/src="https?:/);
      expect(t).not.toMatch(/MathJax/);
    }
  });
});

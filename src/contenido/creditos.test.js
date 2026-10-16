import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { EYM, IMAGENES_EYM, PLATAFORMA, TECNOLOGIAS, listaNombres } from './creditos.js';
import { IMAGENES } from './calor-ondas/imagenes.js';

const raiz = path.resolve(__dirname, '../..');
const EXT = /\.(png|jpe?g|gif|webp|svg|avif|ico|mp4|webm)$/i;
const NO_SE_SUBEN = ['src/contenido/fotos/imgagen_referencia_frontend.png'];

const archivos = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? archivos(p) : [p];
  });

describe('créditos', () => {
  it('Electricidad y Magnetismo tiene los tres desarrolladores en orden', () => {
    expect(EYM.desarrolladores).toEqual(['Juan Sebastian Martinez', 'Juan David Rivera', 'Eduardo Enrique Vergara']);
    expect(listaNombres(EYM.desarrolladores)).toBe('Juan Sebastian Martinez, Juan David Rivera y Eduardo Enrique Vergara');
    expect(PLATAFORMA.nombre).toBe('Oscila');
  });

  it('cada tecnología tiene licencia con enlace', () => {
    for (const t of TECNOLOGIAS) {
      expect(t.licencia, t.nombre).toBeTruthy();
      expect(t.licenciaUrl, t.nombre).toMatch(/^https:\/\//);
    }
  });

  it('toda imagen de public/ y de las figuras de ejercicios está en un inventario con crédito', () => {
    const conCredito = new Set([
      ...Object.values(IMAGENES).map((im) => im.src),
      ...IMAGENES_EYM.flatMap((g) => g.archivos ?? []),
    ]);
    const publicas = archivos(path.join(raiz, 'public'))
      .filter((p) => EXT.test(p))
      .map((p) => path.relative(path.join(raiz, 'public'), p).split(path.sep).join('/'));
    const sinCredito = publicas.filter((p) => !conCredito.has(p));
    expect(sinCredito).toEqual([]);

    const carpetas = IMAGENES_EYM.filter((g) => g.carpeta);
    const figuras = archivos(path.join(raiz, 'src'))
      .filter((p) => EXT.test(p))
      .filter((p) => !NO_SE_SUBEN.includes(path.relative(raiz, p).split(path.sep).join('/')));
    const fuera = figuras.filter((p) => !carpetas.some((g) => path.relative(path.join(raiz, g.carpeta), p).split(path.sep)[0] !== '..'));
    expect(fuera.map((p) => path.relative(raiz, p))).toEqual([]);
    for (const g of IMAGENES_EYM) expect(g.credito, g.titulo).toBeTruthy();
  });

  it('no queda el nombre anterior de la plataforma', () => {
    const revisar = [
      ...archivos(path.join(raiz, 'src')).filter((p) => /\.(jsx?|css|md|json)$/.test(p) && !p.endsWith('creditos.test.js')),
      ...archivos(path.join(raiz, 'public')).filter((p) => /\.(svg|html|json|txt)$/.test(p)),
      path.join(raiz, 'index.html'),
      path.join(raiz, 'README.md'),
    ];
    const conNombre = revisar.filter((p) => fs.readFileSync(p, 'utf8').includes('Circuitos en Vivo'));
    expect(conNombre).toEqual([]);
  });
});

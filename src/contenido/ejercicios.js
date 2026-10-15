// Carga los 15 ejercicios resueltos (Markdown + KaTeX) y sus figuras SVG.

const textos = import.meta.glob('./ejercicios/ejercicio_*.md', { query: '?raw', import: 'default', eager: true });
const figurasUrl = import.meta.glob('./ejercicios/figuras/*.svg', { query: '?url', import: 'default', eager: true });

/** "figuras/ej01_fig1.svg" → URL empaquetada por Vite */
export const figuras = Object.fromEntries(Object.entries(figurasUrl).map(([ruta, url]) => [`figuras/${ruta.split('/').pop()}`, url]));

/** Divide el texto de la solución en un preámbulo (diagramas, fórmulas) e incisos que empiezan con "### ". */
function partirSolucion(texto) {
  const partes = texto.split(/^(?=### )/m);
  const preambulo = partes[0].startsWith('### ') ? '' : partes.shift();
  const incisos = partes.map((p) => {
    const [linea, ...resto] = p.split('\n');
    return { titulo: linea.replace(/^###\s*/, '').trim(), cuerpo: resto.join('\n').trim() };
  });
  return { preambulo: preambulo.trim(), incisos };
}

let seccion = '';
export const EJERCICIOS = Object.keys(textos)
  .sort()
  .map((ruta) => {
    const md = textos[ruta].replace(/\r\n/g, '\n');
    const s = md.match(/<!--\s*Sección:\s*(.+?)\s*-->/);
    if (s) seccion = s[1];
    const numero = Number(md.match(/^# Ejercicio (\d+)/m)?.[1]);
    const enunciado = md.split(/^## Enunciado\s*$/m)[1]?.split(/^## Solución\s*$/m)[0]?.trim() ?? '';
    const solucion = md.split(/^## Solución\s*$/m)[1]?.trim() ?? '';
    return { numero, seccion, enunciado, ...partirSolucion(solucion) };
  });

export const SECCIONES = [...new Set(EJERCICIOS.map((e) => e.seccion))];

// Créditos de Oscila

export const PLATAFORMA = {
  nombre: 'Oscila',
  lema: 'Física que se ve y se calcula',
};

export const EYM = {
  modulo: 'Electricidad y Magnetismo',
  desarrolladores: ['Juan Sebastian Martinez', 'Juan David Rivera', 'Eduardo Enrique Vergara'],
  profesor: 'Jarvin Mestra Páez',
  universidad: 'Universidad del Magdalena',
  evento: 'II Foro Internacional de Física',
};

export const listaNombres = (nombres) =>
  nombres.length < 2 ? nombres.join('') : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;

export const INSPIRACION = {
  texto: 'El editor de circuitos se inspiró en la interfaz de circuit-diagram.org (proyecto independiente, sin afiliación).',
  enlace: 'https://www.circuit-diagram.org/',
};

const MIT = { licencia: 'MIT', licenciaUrl: 'https://opensource.org/license/mit' };

export const TECNOLOGIAS = [
  { nombre: 'React', uso: 'Interfaz', url: 'https://react.dev/', ...MIT },
  { nombre: 'Vite', uso: 'Desarrollo y empaquetado', url: 'https://vite.dev/', ...MIT },
  { nombre: 'KaTeX', uso: 'Fórmulas (con sus fuentes)', url: 'https://katex.org/', ...MIT },
  {
    nombre: 'Lexend',
    uso: 'Tipografía',
    url: 'https://fonts.google.com/specimen/Lexend',
    licencia: 'SIL Open Font License 1.1',
    licenciaUrl: 'https://openfontlicense.org/',
  },
  { nombre: 'jsPDF', uso: 'Plan de estudio en PDF', url: 'https://github.com/parallax/jsPDF', ...MIT },
  {
    nombre: 'API de Gemini (Google)',
    uso: 'Reconocimiento de fotos de circuitos',
    url: 'https://ai.google.dev/',
    licencia: 'Términos de la API de Gemini',
    licenciaUrl: 'https://ai.google.dev/gemini-api/terms',
  },
  {
    nombre: 'react-markdown, remark-gfm, remark-math, rehype-katex y Zod',
    uso: 'Contenido en Markdown y validación de datos',
    url: null,
    ...MIT,
  },
];

export const IMAGENES_EYM = [
  {
    titulo: 'Fotos de la práctica de la fuente de 12 V (Aplicaciones)',
    archivos: ['aplicaciones/electronica1.png', 'aplicaciones/electronica2.png', 'aplicaciones/electronica3.png', 'aplicaciones/electronica4.png'],
    credito: 'Equipo de Calor y Ondas.',
  },
  {
    titulo: 'Figuras de los ejercicios resueltos',
    carpeta: 'src/contenido/ejercicios/figuras',
    credito:
      'Enunciados del material del curso Electricidad y Magnetismo, prof. Jarvin Mestra Páez, Universidad del Magdalena. Figuras redibujadas (LaTeX/TikZ) y soluciones elaboradas por el equipo de Oscila.',
  },
  {
    titulo: 'Escudo de la Universidad del Magdalena',
    archivos: ['logo-unimagdalena.png'],
    credito: 'Marca institucional de la Universidad del Magdalena, usada para identificar el proyecto.',
  },
  {
    titulo: 'Ícono y favicon de Oscila',
    archivos: ['favicon.svg'],
    credito: 'Dibujo propio (SVG) de Oscila.',
  },
];

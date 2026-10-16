// Imágenes de Calor y Ondas

const commons = (archivo, autor, licencia, licenciaUrl) => ({
  tipo: 'commons',
  archivo,
  autor,
  pagina: `https://commons.wikimedia.org/wiki/File:${archivo}`,
  licencia,
  licenciaUrl,
});

const CC_BY_SA_4 = ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'];
const CC_BY_SA_3 = ['CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'];

const EQUIPO = { tipo: 'equipo', autor: 'Equipo de Calor y Ondas' };
const EQUIPO_IA = { tipo: 'equipo', autor: 'Equipo de Calor y Ondas', nota: 'elaborada con apoyo de IA (Gemini)' };
const PROPIA = { tipo: 'propia', autor: 'Oscila' };

export const IMAGENES = {
  // Teoría
  federpendel: {
    src: 'calor-ondas/Federpendel.gif',
    alt: 'Fuerza restauradora en un sistema masa-resorte',
    ancho: 350,
    credito: commons('Federpendel.gif', 'And1mu', ...CC_BY_SA_4),
  },
  'mas-seno-coseno': {
    src: 'calor-ondas/mas-seno-coseno.svg',
    alt: 'Gráfica sinusoidal del M.A.S.: un punto gira en una circunferencia y sus proyecciones dibujan cos θ y sin θ',
    ancho: 500,
    credito: PROPIA,
  },
  'oscilacion-pendulo': {
    src: 'calor-ondas/oscilacion-pendulo.svg',
    alt: 'Péndulo que oscila de ida y vuelta: una oscilación simple',
    ancho: 350,
    credito: PROPIA,
  },
  'orbita-mas': {
    src: 'calor-ondas/Simple_Harmonic_Motion_Orbit.gif',
    alt: 'Movimiento armónico simple como proyección de un movimiento circular',
    ancho: 350,
    credito: commons('Simple_Harmonic_Motion_Orbit.gif', 'Mazemaster', 'Dominio público', null),
  },
  'elongacion-resorte': {
    src: 'calor-ondas/elongacion-resorte.svg',
    alt: 'Bloque unido a un resorte que oscila entre −A y A alrededor de la posición de equilibrio x = 0',
    ancho: 550,
    credito: PROPIA,
  },
  amplitud: {
    src: 'calor-ondas/amplitud.svg',
    alt: 'Masa que oscila entre P1 (−A) y P2 (A); la amplitud es la distancia desde 0 hasta cada extremo',
    ancho: 550,
    credito: PROPIA,
  },
  'periodo-onda': {
    src: 'calor-ondas/Wave_period.gif',
    alt: 'Peridodo',
    ancho: 350,
    credito: commons('Wave_period.gif', 'Superborsuk', ...CC_BY_SA_3),
  },
  'cambio-frecuencia': {
    src: 'calor-ondas/CambioFrec.gif',
    alt: 'Ondas de distinta frecuencia',
    ancho: 350,
    credito: commons('CambioFrec.gif', 'Rubentg', ...CC_BY_SA_4),
  },
  'masa-resorte': {
    src: 'calor-ondas/Mass_Spring_System_Undamped_case_Simple_harmonic_motion.gif',
    alt: 'Sistema masa-resorte',
    ancho: 550,
    credito: commons('Mass_Spring_System_Undamped_case_Simple_harmonic_motion.gif', 'Guillermo Bossio', ...CC_BY_SA_4),
  },
  'velocidad-aceleracion': {
    src: 'calor-ondas/velocidad-aceleracion.svg',
    alt: 'Gráficas de velocidad v(m/s) entre −0.55 y +0.55 y de aceleración a(m/s²) entre −0.6 y +0.6 frente al tiempo, con marcas en T/8, T/4, T/2 y T',
    ancho: 500,
    credito: PROPIA,
  },
  'asociacion-resortes': {
    src: 'calor-ondas/asociacion-resortes.svg',
    alt: 'Resortes k1 y k2 en serie (uno debajo del otro) y en paralelo (uno al lado del otro) sosteniendo un bloque',
    ancho: 350,
    credito: PROPIA,
  },
  'pendulo-simple': {
    src: 'calor-ondas/pendulo-simple.svg',
    alt: 'Péndulo simple: masa m colgada de un soporte en el origen, que forma un ángulo σ con el eje y',
    ancho: 500,
    credito: PROPIA,
  },

  // Aplicaciones
  electronica1: { src: 'aplicaciones/electronica1.png', alt: 'Transformador - Etapa de Transformación', ancho: 550, credito: EQUIPO },
  electronica2: { src: 'aplicaciones/electronica2.png', alt: 'Transformador - Conexión de secundarios', ancho: 350, credito: EQUIPO },
  electronica3: { src: 'aplicaciones/electronica3.png', alt: 'Capacitor de Filtrado', ancho: 350, credito: EQUIPO },
  electronica4: { src: 'aplicaciones/electronica4.png', alt: 'Circuito con Capacitor de Filtrado', ancho: 350, credito: EQUIPO },
  'marino-costera': {
    src: 'calor-ondas/marino-costera.webp',
    alt: 'Tren de ondas incidente sobre un dique rompeolas con escollera y faro',
    ancho: 650,
    credito: EQUIPO_IA,
  },
  'prensa-estampado': {
    src: 'calor-ondas/prensa-estampado.svg',
    alt: 'Prensa de estampado de dos columnas con su tablero de control',
    ancho: 350,
    credito: PROPIA,
  },
  'sistemas-rack': {
    src: 'calor-ondas/sistemas-rack.webp',
    alt: 'Rack con sensores',
    ancho: 650,
    credito: EQUIPO_IA,
  },
  'zaranda-vibratoria': {
    src: 'calor-ondas/zaranda-vibratoria.svg',
    alt: 'Zaranda vibratoria para limpieza de semillas, inclinada y montada sobre resortes',
    ancho: 470,
    credito: PROPIA,
  },
  'cuerda-posiciones': {
    src: 'calor-ondas/cuerda-posiciones.svg',
    alt: 'Cable tensor fijo en sus extremos vibrando en el tercer armónico (3 vientres, nodos en L/3 y 2L/3), visto en los destellos 1 a 5 con amplitudes +A, +A/√2, 0, −A/√2 y −A; el punto P está en el vientre central con A_P = 8.0 mm; L = 60.0 cm',
    ancho: 620,
    credito: { ...PROPIA, nota: 'redibujada para coincidir con el enunciado' },
  },
  'bombas-agua': {
    src: 'calor-ondas/bombas-agua.svg',
    alt: 'Sala de bombas de una planta de tratamiento: bombas con motor sobre bases de concreto y tuberías',
    ancho: 470,
    credito: PROPIA,
  },

  // Ejercicios
  'ejercicio-1': { src: 'calor-ondas/ejercicio-1-boceto.png', alt: 'Boceto del problema', ancho: 720, credito: EQUIPO },
  'ejercicio-2': { src: 'calor-ondas/ejercicio-2-boceto.png', alt: 'Boceto del problema', ancho: 520, credito: EQUIPO },
  'ejercicio-3': { src: 'calor-ondas/ejercicio-3-boceto.png', alt: 'Boceto del problema', ancho: 720, credito: EQUIPO },
  'ejercicio-4': { src: 'calor-ondas/ejercicio-4-boceto.png', alt: 'Boceto del problema', ancho: 500, credito: EQUIPO },
  'ejercicio-5': { src: 'calor-ondas/ejercicio-5-boceto.png', alt: 'Boceto del problema', ancho: 720, credito: EQUIPO_IA },
};

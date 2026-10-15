// Aplicaciones de Electricidad y Magnetismo en ingeniería.
// "revisar: true" marca contenido nuevo que el equipo debe revisar antes del foro.

import { formatearValor } from '../circuitos/unidades.js';

const comp = (id, tipo, x, y, rot, valor) => ({ id, tipo, x, y, rot, valor, texto: formatearValor(valor, tipo) });
const w = (id, x1, y1, x2, y2) => ({ id, x1, y1, x2, y2 });

// Divisor de voltaje con una fotorresistencia (LDR), listo para abrir en el montaje
export const DOC_DIVISOR = {
  componentes: [comp('E1', 'fuente', 0, 10, 270, 5), comp('R1', 'resistencia', 8, 1, 90, 10e3), comp('RL', 'resistencia', 8, 7, 90, 1e3)],
  cables: [w('d1', 0, 6, 0, 0), w('d2', 0, 0, 8, 0), w('d3', 8, 0, 8, 1), w('d4', 8, 5, 8, 7), w('d5', 8, 11, 8, 12), w('d6', 8, 12, 0, 12), w('d7', 0, 12, 0, 10)],
  nodos: [],
  etiquetas: [{ id: 'eo', x: 8, y: 6, texto: 'o' }],
};

export const APLICACIONES = [
  {
    id: 'fuente',
    titulo: 'Ingeniería Electrónica: fuente de alimentación de 12 V',
    resumen: 'Transformador, rectificador, filtro con condensador y regulación con Zener.',
    imagenes: [
      { src: 'aplicaciones/electronica1.png', pie: 'Etapas de una fuente: transformador, rectificador, filtro y regulador.' },
      { src: 'aplicaciones/electronica2.png', pie: 'Salida del transformador (18 V AC) en el osciloscopio.' },
      { src: 'aplicaciones/electronica3.png', pie: 'Señal rectificada y filtrada: queda un pequeño rizado.' },
      { src: 'aplicaciones/electronica4.png', pie: 'Salida regulada: una línea recta (12 V DC).' },
    ],
    md: String.raw`
Una fuente de alimentación convierte la corriente alterna de la red en corriente continua. Se diseñó una fuente de **12 V y 120 mA** en cuatro etapas.

**1. Transformador.** Reduce los 110 V AC de la red. Se conectaron en serie dos secundarios de 9 V: $V_{rms}=18\ \mathrm{V}$. Además aísla el circuito de la red.

**2. Rectificador (puente de 4 diodos 1N4001).** Aprovecha los dos semiciclos. El voltaje pico se calcula con el pico de la señal menos la caída de dos diodos ($2\times0.7\ \mathrm{V}$):

$$
V_p=V_{rms}\sqrt2-1.4=(18)(1.414)-1.4\approx 24.1\ \mathrm{V}
$$

**3. Filtro (condensador electrolítico de 1000 µF / 35 V).** El condensador se carga en cada pico y entrega carga a la carga entre picos; el voltaje cae un poco: es el **rizado**. Con rectificación de onda completa la frecuencia del rizado es $f=120\ \mathrm{Hz}$ y la corriente de la carga es $I=120\ \mathrm{mA}$. Si se acepta un rizado de diseño $V_r=2.1\ \mathrm{V}$, la capacitancia mínima es

$$
C_{min}=\frac{I}{f\,V_r}=\frac{0.120}{(120)(2.1)}\approx 4.76\times10^{-4}\ \mathrm{F}=476\ \mu\mathrm{F}
$$

El condensador elegido (1000 µF) supera ese mínimo; con él, el rizado real es $V_r=\dfrac{I}{fC}=\dfrac{0.120}{(120)(1000\times10^{-6})}\approx1.0\ \mathrm{V}$.

**4. Regulación (Zener de 12 V en paralelo con la carga).** La carga de $12\ \mathrm{V}$ y $120\ \mathrm{mA}$ equivale a

$$
R_L=\frac{V}{I}=\frac{12}{0.12}=100\ \Omega
$$

y la resistencia en serie que limita la corriente, despreciando la corriente del Zener, es

$$
R=\frac{V_p-V_L}{I}=\frac{24.1-12}{0.12}\approx 100\ \Omega\quad(\text{de }5\ \mathrm{W})
$$

En el osciloscopio, la salida regulada es una línea recta: voltaje continuo y estable.

**Relación con el curso:** el filtro es un condensador ($Q=CV$, $U=\tfrac12CV^2$) y la regulación usa la ley de Ohm y un divisor de voltaje.
`,
  },
  {
    id: 'desfibrilador',
    revisar: true,
    titulo: 'Ingeniería Biomédica: el condensador de un desfibrilador',
    resumen: 'Energía almacenada en un condensador y su descarga a través del cuerpo.',
    md: String.raw`
Un desfibrilador guarda energía en un condensador y la descarga en milisegundos a través del pecho del paciente. Supongamos un condensador de $C=100\ \mu\mathrm{F}$ cargado a $V=2000\ \mathrm{V}$.

**Carga almacenada:**

$$
Q=CV=(100\times10^{-6})(2000)=0.200\ \mathrm{C}
$$

**Energía almacenada:**

$$
U=\tfrac12CV^2=\tfrac12(100\times10^{-6})(2000)^2=200\ \mathrm{J}
$$

Si la resistencia del tórax es de unos $R=50\ \Omega$, la corriente al inicio de la descarga es $I_0=\dfrac{V}{R}=\dfrac{2000}{50}=40\ \mathrm{A}$, y el tiempo característico de la descarga es $\tau=RC=(50)(100\times10^{-6})=5\ \mathrm{ms}$.

**Idea clave:** con el mismo condensador, duplicar el voltaje cuadruplica la energía ($U\propto V^2$).
`,
  },
  {
    id: 'cableado',
    revisar: true,
    titulo: 'Ingeniería Eléctrica y Civil: caída de voltaje en una extensión',
    resumen: 'Resistencia de un conductor (R = ρL/A) y potencia perdida en el cable.',
    md: String.raw`
Una extensión de **30 m** con cable de cobre calibre 14 AWG ($A=2.08\ \mathrm{mm^2}$) alimenta un equipo que consume **10 A**. La corriente recorre ida y vuelta, así que el largo total es $L=60\ \mathrm{m}$. Para el cobre, $\rho=1.72\times10^{-8}\ \Omega\,\mathrm{m}$.

**Resistencia del cable:**

$$
R=\rho\frac{L}{A}=(1.72\times10^{-8})\frac{60}{2.08\times10^{-6}}\approx0.496\ \Omega
$$

**Caída de voltaje y potencia perdida:**

$$
V=IR=(10)(0.496)\approx4.96\ \mathrm{V},\qquad P=I^2R=(10)^2(0.496)\approx49.6\ \mathrm{W}
$$

Casi 50 W se convierten en calor en el cable. Por eso las normas limitan la longitud de los circuitos y exigen calibres mayores (más área, menos resistencia) para corrientes altas.
`,
  },
  {
    id: 'divisor',
    revisar: true,
    titulo: 'Ingeniería de Sistemas y Electrónica: divisor de voltaje con un sensor de luz',
    resumen: 'Un circuito en serie convierte la resistencia de un sensor en un voltaje que lee un microcontrolador.',
    circuito: DOC_DIVISOR,
    md: String.raw`
Una fotorresistencia (LDR) cambia su resistencia con la luz: unos $R_L=1\ \mathrm{k}\Omega$ con luz y unos $100\ \mathrm{k}\Omega$ en la oscuridad. Para leerla con un microcontrolador (Arduino) se conecta en **serie** con una resistencia fija $R_1=10\ \mathrm{k}\Omega$ a una fuente de $5\ \mathrm{V}$, y se mide el voltaje en el punto $o$, entre las dos resistencias.

Como están en serie, la corriente es la misma: $I=\dfrac{\varepsilon}{R_1+R_L}$, y el voltaje sobre la LDR es

$$
V_o=IR_L=\varepsilon\,\frac{R_L}{R_1+R_L}
$$

| Condición | $R_L$ | $V_o$ |
|---|---|---|
| Con luz | $1\ \mathrm{k}\Omega$ | $5\cdot\dfrac{1}{11}\approx0.45\ \mathrm{V}$ |
| Penumbra | $10\ \mathrm{k}\Omega$ | $2.50\ \mathrm{V}$ |
| Oscuridad | $100\ \mathrm{k}\Omega$ | $5\cdot\dfrac{100}{110}\approx4.55\ \mathrm{V}$ |

El microcontrolador convierte ese voltaje en un número y decide, por ejemplo, encender una lámpara. Abre este circuito en el montaje y cambia el valor de $R_L$ para ver cómo cambia el reparto del voltaje.
`,
  },
];

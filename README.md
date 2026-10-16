# Oscila — Plataforma de física

*Física que se ve y se calcula.*

Plataforma educativa de la Universidad del Magdalena, preparada para el **II Foro Internacional de Física**. Tiene tres módulos:

- **Electricidad y Magnetismo** (principal).
- **Calor y Ondas** (en revisión; restaurado de la versión anterior, oculto en modo feria).
- **Mecánica** (próximamente).

El centro de Electricidad y Magnetismo es el **montaje virtual de circuitos**:

1. **Dibuja** un circuito en una cuadrícula, al estilo de circuit-diagram.org, **o tómale una foto** a uno dibujado a mano.
2. La plataforma lo **clasifica** (serie, paralelo, mixto o no reducible) y explica por qué.
3. Lo **resuelve paso a paso** con el formato de los ejercicios resueltos del curso:
   - diagrama y fórmulas;
   - despeje simbólico, números en SI, ecuaciones numeradas y respuestas en recuadro;
   - comprobación de carga y energía.

Se resuelve por **reducción** (con cada circuito intermedio dibujado) o por **leyes de Kirchhoff**: las mallas son las ventanas del dibujo, recorridas en sentido horario, y se muestra la sustitución o la eliminación de Gauss.

Cada número que se muestra se verifica con un **análisis nodal modificado (MNA)** independiente. Si algo no coincide (tolerancia del 1 %), la solución no se muestra.

## Secciones

| Sección | Contenido |
|---|---|
| Inicio | Portada con los tres módulos y créditos |
| Teoría | Potencial eléctrico, capacitancia, resistencia y circuitos, leyes de Kirchhoff (según la hoja de fórmulas del curso) |
| Aplicaciones | Fuente de 12 V, desfibrilador, caída de voltaje en un cable y divisor de voltaje con sensor |
| Montaje | Editor, reconocimiento de fotos y solución paso a paso |
| Ejercicios | Los 15 ejercicios resueltos, agrupados por tema e incisos colapsables |
| Test | 12 preguntas con retroalimentación y plan de estudio en PDF |
| Créditos | Equipos, profesores, inspiración, tecnologías e imágenes (botón en la barra lateral) |

Calor y Ondas tiene su propia portada, marco conceptual, aplicaciones, laboratorio de simulaciones, ejercicios y test.

En cualquier sección, la tecla **F** o el botón de la barra activan el **modo feria**: pantalla completa y letra grande.

## Ejecutar

Requisitos: Node.js 18 o superior.

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173
npm test           # pruebas (Vitest)
npm run build      # versión de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

### Sin internet (día del foro)

1. Con internet, ejecuta una vez `npm install` y `npm run build`.
2. Después, sin internet: `npm run preview` y abre `http://localhost:4173`.

Todo funciona sin conexión: el editor, la solución, la teoría, los ejercicios, el test y la galería de **ejemplos de foto guardados**. Lo único que necesita internet es reconocer fotos nuevas.

### Reconocimiento de fotos (Gemini, free tier)

1. Crea una API key gratuita en [Google AI Studio](https://aistudio.google.com/apikey). No pide tarjeta.
2. Para desarrollo local: copia `.env.example` como `.env.local` y llena `GEMINI_API_KEY`. `npm run dev` monta `/api/reconocer` con esa key.
3. En Vercel: importa el repositorio y agrega las variables de entorno `GEMINI_API_KEY` y, si quieres, `GEMINI_MODEL`.

La key **nunca llega al navegador**: la foto se envía a la función serverless `api/reconocer.js`, que llama a Gemini y valida el JSON con un esquema.

- Modelo por defecto: `gemini-3.5-flash-lite`.
- Los límites del free tier cambian: revísalos en *AI Studio → Rate limits*.
- La misma foto no gasta otra solicitud (caché por hash en el navegador).
- Si se agota la cuota, la plataforma lo dice y ofrece la galería sin internet.

**Fotos de la galería:** guarda las fotos reales de los circuitos de los ejercicios 11 a 15 dibujados a mano como `public/ejemplos_foto/ej11.jpg` … `ej15.jpg`. Si reconoces una de esas fotos en línea, con el botón *Descargar JSON* puedes reemplazar `src/contenido/fotos/ejXX.json`.

## Estructura

```
api/                    función serverless de reconocimiento (Vercel) y sus pruebas
src/circuitos/          núcleo de cálculo (sin React)
  unidades.js             valores con prefijos SI (4,7 kΩ, 10 µF…)
  geometria.js netlist.js dibujo del editor → netlist
  mna.js                  análisis nodal modificado (verificador)
  reduccion.js            reducción serie/paralelo
  clasificacion.js        serie / paralelo / mixto / no reducible
  mallas.js kirchhoff.js  ventanas del dibujo y ecuaciones de nodos y mallas
  sistemas.js             sustitución (≤ 3 incógnitas) y Gauss (≥ 4) paso a paso
  pasos.js                solución completa, verificada con MNA
  layout.js               dibujo automático de los circuitos de la reducción
  reconocimiento.js       esquema del JSON de la foto y conversión al editor
src/components/         editor, solución, reconocimiento de fotos, KaTeX
src/contenido/          ejercicios, teoría, aplicaciones y fotos guardadas
src/pages/              secciones de la plataforma
paquete_EyM/            material fuente: ejercicios, hoja de fórmulas y casos de prueba
```

## Créditos

**Electricidad y Magnetismo**

- Desarrolladores: Juan Sebastian Martinez ([@JsMartinez-dev](https://github.com/JsMartinez-dev)), Juan David Rivera y Eduardo Enrique Vergara.
- Profesor: Jarvin Mestra Páez · Universidad del Magdalena · II Foro Internacional de Física.

**Calor y Ondas.** Módulo original desarrollado por Juan Sebastian Martinez Uribe, Bibiana Arteaga Castellanos, Esteban Andrés Arévalo, Ali David Valle Mancilla, Yulia Cabana Olivella, Omar Andres Rojas Arango, Carlos Alberto Teran Lizcano, Alejandro Smith Cano Pezzano, Gabriel González Silva, Daniel Miranda Morales y Andrés Felipe Chacon Saucedo. Profesor: Jean Linero Cueto. La versión anterior quedó guardada en la etiqueta git `v1-calor-y-ondas`.

**Inspiración.** El editor de circuitos se inspiró en la interfaz de [circuit-diagram.org](https://www.circuit-diagram.org/) (proyecto independiente, sin afiliación).

**Tecnologías y licencias.** React, Vite, KaTeX, jsPDF, react-markdown, remark/rehype y Zod (MIT); tipografía Lexend (SIL Open Font License 1.1); [API de Gemini de Google](https://ai.google.dev/gemini-api/terms) para el reconocimiento de fotos.

**Imágenes.** Cada imagen ajena lleva autor, fuente y licencia en la app (sección Créditos). Las de Wikimedia Commons se usan sin modificaciones con su licencia (CC BY-SA o dominio público); las ilustraciones SVG sin fuente ajena son dibujos propios de Oscila. El inventario está en `src/contenido/creditos.js` y `src/contenido/calor-ondas/imagenes.js`.

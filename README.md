<p align="center">
  <img src="public/logotipos/LOGOTIPO-NOMBRE.svg" alt="Oscila — Plataforma de física" width="300">
</p>

<p align="center"><em>Física que se ve y se calcula.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/estado-en%20desarrollo-orange" alt="Estado: en desarrollo">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB" alt="React 18"></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF" alt="Vite 5"></a>
  <a href="#sin-internet-d%C3%ADa-del-foro"><img src="https://img.shields.io/badge/funciona%20sin%20internet-parcialmente-2E7D32" alt="Funciona parcialmente sin internet"></a>
  <a href="#secciones"><img src="https://img.shields.io/badge/m%C3%B3dulo%20principal-Electricidad%20y%20Magnetismo-6A1B9A" alt="Módulo principal: Electricidad y Magnetismo"></a>
  <a href="#cr%C3%A9ditos"><img src="https://img.shields.io/badge/proyecto-educativo-1565C0" alt="Proyecto educativo"></a>
</p>

<p align="center">
  Plataforma educativa de la Universidad del Magdalena para aprender, visualizar y resolver problemas de física.
</p>

Preparada para el **II Foro Internacional de Física**. Tiene tres módulos:

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
| Acceso | Inicio de sesión, registro y recuperación de contraseña con Supabase |
| Inicio | Portada de la plataforma con los tres módulos, créditos y los controles de la cuenta |
| Teoría | Potencial eléctrico, capacitancia, resistencia y circuitos, leyes de Kirchhoff (según la hoja de fórmulas del curso) |
| Aplicaciones | Fuente de 12 V, desfibrilador, caída de voltaje en un cable y divisor de voltaje con sensor |
| Montaje | Editor, reconocimiento de fotos y solución paso a paso |
| Ejercicios | Los 15 ejercicios resueltos, agrupados por tema e incisos colapsables |
| Test | 12 preguntas con retroalimentación y plan de estudio en PDF |
| Créditos | Equipos, profesores, inspiración, tecnologías e imágenes (botón en la barra lateral) |

Calor y Ondas tiene su propia portada, marco conceptual, aplicaciones, laboratorio de simulaciones, ejercicios y test.

En cualquier sección, la tecla **F** o el botón de la barra activan el **modo feria**: pantalla completa y letra grande.

## Ejecutar

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173
npm test           # pruebas (Vitest)
npm run build      # versión de producción en dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

### Sin internet (día del foro)

1. Con internet, ejecuta una vez `npm install` y `npm run build`.
2. Ejecuta `npm run preview`, abre `http://localhost:4173` e inicia sesión antes de perder la conexión. Conserva abierta la pestaña durante la demostración.

El editor, la solución, la teoría, los ejercicios, el test y la galería de **montajes guardados** funcionan sin conexión. El acceso a las cuentas y el reconocimiento de fotos nuevas necesitan internet.

### Cuentas con Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard). En **Connect**, copia la URL del proyecto y la clave **Publishable** a `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en `.env.local`. Vite expone las variables con prefijo `VITE_` al navegador, así que usa la clave publicable.
2. En **Authentication → URL Configuration**, añade `http://localhost:5173/` a **Redirect URLs**, o usa la dirección que imprima Vite. Mantén habilitada la confirmación por correo para probar el flujo completo.
3. Reinicia `npm run dev`. Desde la pantalla de acceso, crea una cuenta usando el correo de un miembro del proyecto si usas el servicio de correo predeterminado de Supabase. Abre el enlace de confirmación y verifica que puedas iniciar y cerrar sesión. El nombre se guarda como `full_name` en los metadatos del usuario y aparece en la cabecera al entrar.
4. Para Vercel, configura las mismas dos variables en el proyecto y vuelve a desplegar. En Supabase, pon el dominio publicado en **Site URL** y añádelo a **Redirect URLs**. Configura [SMTP propio](https://supabase.com/docs/guides/auth/auth-smtp) antes de abrir el registro al público.

El [correo de confirmación de Oscila](docs/correo-confirmacion/README.md) tiene una plantilla en español lista para configurar en **Confirm sign up** de Supabase. Incluye vistas previas, validación del escape del nombre y los pasos separados para plantilla, remitente y SMTP. Los archivos del repositorio no activan la plantilla alojada automáticamente.

El flujo renovado conserva Supabase Auth, prepara **SMTP propio y Google OAuth opcional**, distingue errores de envío y acceso, y permite registrar a otra persona desde la confirmación con campos limpios. Consulta [arquitectura, diagnóstico, costes, límites, configuración y pruebas](docs/autenticacion/README.md). Google se muestra con `VITE_AUTH_GOOGLE=true` solo después de configurar el proveedor; sus secretos y las credenciales SMTP se guardan en Supabase, nunca en el navegador. Cambiar la interfaz no amplía las cuotas del proyecto ni del proveedor.

### Reconocimiento de fotos (Gemini, free tier)

1. Crea una API key gratuita en [Google AI Studio](https://aistudio.google.com/apikey). No pide tarjeta.
2. Para desarrollo local: copia `.env.example` como `.env.local` y llena `GEMINI_API_KEY`. `npm run dev` monta `/api/reconocer` con esa key.
3. En Vercel: importa el repositorio y agrega las variables de entorno `GEMINI_API_KEY` y, si quieres, `GEMINI_MODEL`.

La key **nunca llega al navegador**: la foto se envía a la función serverless `api/reconocer.js`, que llama a Gemini y valida el JSON con un esquema.

- Modelo por defecto: `gemini-3.5-flash-lite`.
- Los límites del free tier cambian: revísalos en *AI Studio → Rate limits*.
- La misma foto no gasta otra solicitud (caché por hash en el navegador).
- Si se agota la cuota, la plataforma lo dice y ofrece la galería sin internet.

**Montajes guardados:** los ejercicios 11 a 15 incluyen sus esquemas locales. Se abren directamente en el editor para revisar, modificar y calcular sin internet; no requieren fotografías ni solicitudes a Gemini.

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
src/contenido/          ejercicios, teoría, aplicaciones y montajes guardados
src/pages/              secciones de la plataforma
paquete_EyM/            material fuente: ejercicios, hoja de fórmulas y casos de prueba
```

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para definir tareas, crear ramas desde `main`, verificar cambios y solicitar revisión. Los PR usan una [plantilla breve](.github/pull_request_template.md) y cuentan con un [workflow de pruebas y compilación](.github/workflows/validacion.yml); las protecciones de `main` requieren configuración administrativa aparte.

## Créditos

**Electricidad y Magnetismo**

- Desarrolladores: Juan Sebastian Martinez ([@JsMartinez-dev](https://github.com/JsMartinez-dev)), Juan David Rivera y Eduardo Enrique Vergara.
- Profesor: Jarvin Mestra Páez · Universidad del Magdalena · II Foro Internacional de Física.

**Calor y Ondas.** Módulo original desarrollado por Juan Sebastian Martinez Uribe, Bibiana Arteaga Castellanos, Esteban Andrés Arévalo, Ali David Valle Mancilla, Yulia Cabana Olivella, Omar Andres Rojas Arango, Carlos Alberto Teran Lizcano, Alejandro Smith Cano Pezzano, Gabriel González Silva, Daniel Miranda Morales y Andrés Felipe Chacon Saucedo. Profesor: Jean Linero Cueto. La versión anterior quedó guardada en la etiqueta git `v1-calor-y-ondas`.

**Inspiración.** El editor de circuitos se inspiró en la interfaz de [circuit-diagram.org](https://www.circuit-diagram.org/) (proyecto independiente, sin afiliación).

**Tecnologías y licencias.** React, Vite, KaTeX, jsPDF, react-markdown, remark/rehype y Zod (MIT); tipografía Lexend (SIL Open Font License 1.1); [API de Gemini de Google](https://ai.google.dev/gemini-api/terms) para el reconocimiento de fotos.

**Imágenes.** Cada imagen ajena lleva autor, fuente y licencia en la app (sección Créditos). Las de Wikimedia Commons se usan sin modificaciones con su licencia (CC BY-SA o dominio público); las ilustraciones SVG sin fuente ajena son dibujos propios de Oscila. El inventario está en `src/contenido/creditos.js` y `src/contenido/calor-ondas/imagenes.js`.

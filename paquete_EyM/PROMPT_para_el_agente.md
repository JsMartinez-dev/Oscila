Olvida el análisis anterior del proyecto de Calor y Ondas: ese proyecto ya pasó y no lo vamos a presentar. Vamos a reutilizar el mismo código (React + Vite) para construir una plataforma nueva de **Electricidad y Magnetismo**. La vamos a presentar en el **II Foro Internacional de Física de la Universidad del Magdalena**, en una mesa de exhibición, el **martes 20 de octubre en la tarde**. Hay muy pocos días, así que prioriza que lo esencial funcione bien en vivo.

## Material de entrada

En la raíz del proyecto copié la carpeta `paquete_EyM/`:
- `ejercicios/ejercicio_01.md` … `ejercicio_15.md`: 15 ejercicios con enunciado y solución completa paso a paso. Usan Markdown con matemáticas en LaTeX compatible con KaTeX (`$...$` en línea, `$$...$$` en bloque, `\boxed{}` para las respuestas, `\tag{n}` para numerar ecuaciones). El comentario `<!-- Sección: ... -->` marca dónde empieza cada tema.
- `ejercicios/figuras/*.svg`: los 33 diagramas de esos ejercicios, ya referenciados desde los .md.
- `casos/casos_prueba_circuitos.json`: los circuitos de los ejercicios 9 a 15 como netlists, con los resultados correctos verificados. Úsalos como pruebas automáticas del solucionador.
- `Hoja_maestra_de_formulas.pdf`: las fórmulas y la convención de signos que usa el curso. La teoría y los procedimientos de la plataforma deben seguirla.
- `Ejercicios_resueltos_Electricidad.pdf`: los mismos ejercicios ya maquetados. Es la referencia de cómo debe verse una solución.

## Cambios

### 1. Datos del proyecto
- Desarrolladores de Electricidad y Magnetismo, en este orden: Juan Sebastian Martinez, Juan David Rivera y Eduardo Enrique Vergara. Deben aparecer en la portada, la sección Créditos, el README y el PDF que genera el test.
- Materia: **Electricidad y Magnetismo**. Profesor: **Jarvin Mestra Páez**. Universidad del Magdalena.
- Elimina todo lo de Calor y Ondas: oscilaciones, M.A.S., péndulo, resortes, el profesor anterior, el título "Onda Expansiva" y el contenido de ondas. Ponle a la plataforma un título provisional relacionado con circuitos y EyM, y propónme 3 alternativas al final.

### 2. Secciones reescritas para EyM
- **Teoría:** potencial eléctrico, capacitancia, resistencia y circuitos, y leyes de Kirchhoff, siguiendo la hoja de fórmulas y su convención de signos.
- **Ejemplos de ingeniería:** aplicaciones de EyM. Puedes reutilizar la fuente de 12 V, pero corrige sus errores: $V_p=V_{rms}\sqrt2-1.4$ y $C_{min}=476\,\mu\mathrm F$.
- **Ejercicios:** los 15 del paquete, agrupados por sección, con KaTeX y sus figuras. Que se puedan colapsar por inciso.
- **Test:** al menos 10 preguntas nuevas de EyM. El PDF que genera debe mostrar a los tres desarrolladores y la materia nueva.

### 3. Montaje virtual de circuitos (lo principal; reemplaza el laboratorio de oscilaciones)

**3a. Editor de circuitos al estilo de https://www.circuit-diagram.org/**
- Cuadrícula con componentes: fuente DC (con polaridad + y −), resistencia, condensador, cable, nodo y etiqueta de punto (a, b, c…).
- Se puede arrastrar, rotar, conectar, borrar y deshacer.
- Los valores se editan con unidades y prefijos (Ω, kΩ, µF, nF, V…) y se convierten a SI antes de calcular.
- Exportar el diagrama como PNG o SVG.

**3b. Reconocimiento de foto de un circuito dibujado a mano, sin pagar**
- Cargar una foto o tomarla con la cámara del celular o portátil.
- Usa un modelo de visión gratuito. Recomiendo el **free tier de la API de Gemini** (modelo Flash; la API key gratis sale de Google AI Studio, sin tarjeta). Llámalo desde una función serverless (por ejemplo Vercel) para que la API key no quede expuesta en el navegador. Verifica en la documentación actual el nombre del modelo y los límites del free tier antes de implementarlo.
- El modelo debe devolver un **JSON estricto con la netlist**: elementos (tipo, valor, unidad, polaridad de las fuentes), nodos y posiciones aproximadas en la foto. Valida el JSON con un esquema.
- El resultado se carga en el editor para que **el usuario confirme o corrija** antes de calcular. Esto es obligatorio: un dibujo a mano a veces se lee mal.
- **Modo sin internet para el foro:** incluye 3 a 5 fotos de ejemplo de circuitos dibujados a mano con su reconocimiento ya guardado, para que la demostración funcione aunque no haya red. El editor manual también tiene que funcionar sin internet.

**3c. Dibujo automático**
- A partir de la netlist, genera un esquema limpio: cables ortogonales, símbolos estándar, valores legibles y sin etiquetas encimadas.
- Respeta más o menos la distribución de la foto original.

**3d. Clasificación del circuito**
- **Serie**: todos los elementos llevan la misma corriente.
- **Paralelo**: todos están entre los mismos dos nodos.
- **Mixto**: se reduce con combinaciones serie/paralelo.
- **No reducible**: puentes o varias fuentes; se resuelve con Kirchhoff.
- Muestra la clasificación y explica por qué.

**3e. Solución paso a paso, igual al formato del PDF del paquete**
- El orden es siempre:
  1. diagrama;
  2. fórmulas que se van a usar;
  3. resolución con despeje simbólico primero y números al final, en SI, con ecuaciones numeradas y respuestas en recuadro;
  4. comprobación física: conservación de la carga y de la energía, signos y unidades.
- Termina con un resumen corto de respuestas.
- **Por reducción** (una sola fuente y circuito reducible):
  - Dibuja cada reducción numerada: "Circuito original", "Circuito 2", …, "Circuito N".
  - Calcula la resistencia o capacitancia equivalente, la corriente o carga total y la potencia o energía de la fuente.
  - Después "regresa" por cada circuito y calcula V, I y P de cada resistencia, o V, Q y U de cada condensador.
- **Por leyes de Kirchhoff** (obligatorio si no es reducible; opcional si lo es):
  - Usa **siempre ambas leyes**: (nodos − 1) ecuaciones de nodo y (ramas − nodos + 1) ecuaciones de malla.
  - Dibuja los sentidos supuestos de las corrientes y el sentido de recorrido de cada malla.
  - Aplica la convención de signos de la hoja: resistencia recorrida a favor de I → −IR, en contra → +IR; fuente de − a + → +ε, de + a − → −ε.
  - Resuelve el sistema mostrando la sustitución.
  - Interpreta los signos negativos como sentido real contrario.
  - Indica si cada fuente entrega o absorbe potencia.
  - Verifica el balance de energía.
- Circuitos con R y C juntos en DC: estado estacionario, con los condensadores como circuito abierto.
- Internamente calcula con un método matricial (análisis nodal modificado) para verificar los números de la explicación. Si no coinciden, no muestres la solución.

**3f. Pruebas**
- Escribe pruebas (Vitest) que carguen `casos_prueba_circuitos.json` y comprueben clasificación, equivalentes, corrientes, voltajes y potencias con tolerancia de 1 %. Todas deben pasar.

### 4. Problemas del escaneo anterior que también hay que arreglar
- Quita el `postinstall` con `chmod`, que falla en Windows.
- Que todo funcione sin internet:
  - imágenes y GIFs descargados a `public/`;
  - KaTeX local en lugar de MathJax por CDN;
  - logo local.
- Elimina las dependencias sin uso, los archivos vacíos y el código duplicado.
- Agrega un **modo feria**: pantalla completa y letra grande.
- Prueba `npm run build` + `npm run preview` sin conexión.

## Forma de trabajo
- Trabaja en una rama nueva de git y deja una etiqueta con la versión anterior antes de borrar nada. Haz commits por etapa.
- Prioridades por si no alcanza el tiempo:
  - **P0:** editor + clasificación + solución paso a paso (reducción y Kirchhoff) + pruebas en verde + ejercicios.
  - **P1:** reconocimiento de foto + modo sin internet con ejemplos guardados.
  - **P2:** teoría, ejemplos y test reescritos.
  - **P3:** pulido visual y modo feria.
- Antes de programar, muéstrame un plan corto: arquitectura, librerías y orden de trabajo. Si alguna decisión no se puede deshacer (borrar contenido, cambiar el stack), pregúntame primero.
- Al terminar, entrégame:
  - cómo ejecutarla (con y sin internet);
  - qué tengo que hacer yo, por ejemplo crear la API key gratuita y configurarla;
  - el resultado de las pruebas;
  - lo que quedó pendiente;
  - un guion de demostración de 2 minutos para la mesa del foro.

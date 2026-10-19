# Oscila: plataforma educativa para el análisis de circuitos

## Introducción

Oscila es una plataforma educativa de física desarrollada para apoyar el aprendizaje de Electricidad y Magnetismo.

Su característica principal es que permite al estudiante:

- estudiar conceptos y fórmulas;
- dibujar un circuito o cargar una fotografía;
- reconocer y validar sus componentes;
- resolver el circuito paso a paso;
- comprobar los resultados mediante un análisis independiente.

La plataforma no entrega únicamente una respuesta numérica. También explica el procedimiento mediante diagramas, fórmulas, ecuaciones y tablas.

La presentación se divide en tres apartados:

1. Plataforma educativa e interfaz.
2. Dibujo y reconocimiento de circuitos.
3. Cálculo y solución paso a paso.

---

# 1. Plataforma educativa e interfaz

## Objetivo del apartado

Explicar qué es Oscila, qué problema resuelve y cómo está organizada la experiencia del usuario.

Oscila reúne en una misma plataforma los contenidos necesarios para estudiar y practicar:

- teoría;
- aplicaciones de la física;
- ejercicios resueltos;
- evaluación interactiva;
- montaje virtual de circuitos;
- reconocimiento de circuitos mediante fotografías.

## Archivos que se pueden presentar

- `src/App.jsx`
- `src/pages/Inicio.jsx`
- `src/components/BarraLateral.jsx`
- `src/contenido/modulos.js`
- `src/contenido/teoria.js`
- `src/contenido/ejercicios.js`
- `src/contenido/test.js`
- `src/estilos/tokens.css`

## Qué hace cada archivo

### `src/App.jsx`

Es el componente principal de la aplicación. Mantiene la página activa y decide qué vista mostrar.

La navegación se realiza mediante estado de React. Por ejemplo, cuando el usuario pulsa una opción del menú, se actualiza la página activa y se renderiza el componente correspondiente.

### `src/pages/Inicio.jsx`

Es la portada de la plataforma. Presenta los módulos, los accesos a teoría, ejercicios, aplicaciones y test, además de los créditos institucionales.

### `src/components/BarraLateral.jsx`

Contiene la navegación principal, los módulos disponibles y las secciones de cada módulo.

### `src/contenido/`

Contiene los datos educativos separados de la interfaz. Esto permite modificar una pregunta, un ejercicio o un texto teórico sin tener que cambiar la estructura visual de React.

## Qué decir durante la presentación

> Oscila está construida como una plataforma modular. La interfaz está separada del contenido educativo, por lo que los textos, ejercicios y preguntas pueden actualizarse sin modificar la lógica visual de la aplicación.

> La navegación se maneja mediante componentes y estado de React. Cada página representa una sección de la plataforma y puede reutilizar componentes como la barra lateral, el renderizado de Markdown y las fórmulas matemáticas.

## Demostración sugerida

1. Mostrar la portada.
2. Explicar los módulos disponibles.
3. Entrar a Teoría.
4. Mostrar un ejercicio.
5. Mostrar el test interactivo.
6. Entrar al Montaje virtual de circuitos.

---

# 2. Dibujo y reconocimiento de circuitos

## Objetivo del apartado

Explicar las dos formas de introducir un circuito:

1. Dibujándolo manualmente en el editor.
2. Reconociéndolo a partir de una fotografía mediante la API de Gemini.

Este apartado muestra cómo una imagen o un dibujo terminan convirtiéndose en datos que el sistema puede analizar.

## Archivos que se pueden presentar

- `src/pages/Montaje.jsx`
- `src/components/editor/Editor.jsx`
- `src/components/editor/useHistorial.js`
- `src/circuitos/Esquema.jsx`
- `src/circuitos/geometria.js`
- `src/circuitos/netlist.js`
- `src/components/foto/ReconocerFoto.jsx`
- `src/components/foto/imagen.js`
- `src/components/foto/almacen.js`
- `src/circuitos/reconocimiento.js`
- `api/_nucleo.js`
- `api/reconocer.js`

## A. Dibujo manual

### `src/components/editor/Editor.jsx`

Es el editor visual. Permite colocar:

- fuentes de voltaje;
- resistencias;
- condensadores;
- cables;
- nodos;
- etiquetas.

El editor conserva el circuito en un documento con una estructura similar a esta:

```js
{
  componentes: [...],
  cables: [...],
  nodos: [...],
  etiquetas: [...]
}
```

El editor no calcula todavía voltajes ni corrientes. Su responsabilidad es construir y entregar el dibujo.

### `src/circuitos/geometria.js`

Interpreta las posiciones del dibujo:

- calcula los terminales de los componentes;
- detecta qué puntos están unidos por cables;
- analiza cruces y nodos;
- determina qué componentes pertenecen a la misma conexión eléctrica.

### `src/circuitos/netlist.js`

Convierte el documento visual en una representación eléctrica llamada netlist.

La netlist ya no describe principalmente posiciones, sino nodos y elementos:

```js
{
  tierra: 'N1',
  nodos: ['N1', 'N2', 'N3'],
  elementos: [
    { tipo: 'fuente', valor: 12, pos: 'N2', neg: 'N1' },
    { tipo: 'resistencia', valor: 100, a: 'N2', b: 'N3' }
  ]
}
```

## B. Reconocimiento mediante Gemini

La API de Gemini permite introducir un circuito mediante una fotografía. El usuario puede cargar una imagen de un circuito dibujado a mano y el sistema intenta identificar:

- componentes;
- valores eléctricos;
- polaridad de las fuentes;
- posiciones;
- conexiones;
- nivel de confianza del reconocimiento.

### Flujo de reconocimiento

```text
Fotografía del circuito
  ↓
ReconocerFoto.jsx
  ↓
Preparación y compresión de imagen
  ↓
POST /api/reconocer
  ↓
api/_nucleo.js
  ↓
API de Gemini
  ↓
Respuesta JSON
  ↓
Validación con Zod
  ↓
reconocimiento.js
  ↓
Documento compatible con Editor.jsx
```

### Archivos principales de la API

#### `src/components/foto/ReconocerFoto.jsx`

Controla el flujo visual de reconocimiento:

- recibe la fotografía;
- muestra el estado de procesamiento;
- envía la imagen al servidor;
- presenta errores o resultados;
- permite revisar y cargar el circuito reconocido.

#### `src/components/foto/imagen.js`

Prepara y comprime la fotografía antes de enviarla.

#### `src/circuitos/reconocimiento.js`

Define el contrato esperado para el reconocimiento, normaliza los datos y convierte la respuesta en un documento que el editor pueda utilizar.

#### `api/_nucleo.js`

Contiene la lógica del servidor:

- valida el tipo y tamaño de la imagen;
- llama a Gemini;
- valida el JSON recibido;
- traduce errores de la API;
- evita enviar la API key al navegador.

#### `api/reconocer.js`

Expone el endpoint serverless:

```text
POST /api/reconocer
```

## Punto importante de seguridad

La clave de Gemini no se guarda en el código del navegador. Permanece en el servidor mediante la variable de entorno `GEMINI_API_KEY`.

El navegador envía la fotografía al endpoint del proyecto y el servidor es quien se comunica con Gemini.

## Qué decir durante la presentación

> El sistema ofrece dos entradas para el circuito: el dibujo manual y el reconocimiento fotográfico. La API de Gemini se utiliza como apoyo para interpretar la fotografía, pero su respuesta no se acepta directamente. Primero se valida, se normaliza y se convierte al mismo formato que utiliza el editor.

> Esto permite que un circuito reconocido desde una imagen continúe por el mismo flujo de cálculo que un circuito dibujado manualmente.

## Demostración sugerida

1. Dibujar un circuito sencillo manualmente.
2. Mostrar sus componentes y cables.
3. Pulsar Calcular.
4. Volver al editor.
5. Abrir la opción Desde una foto.
6. Cargar una imagen de ejemplo.
7. Revisar los componentes reconocidos.
8. Mostrar que el resultado puede editarse antes de calcular.

## Mensaje técnico importante

> Gemini reconoce la imagen, pero no reemplaza al motor matemático del proyecto. La inteligencia artificial se encarga de interpretar la fotografía; la validación y los cálculos eléctricos se realizan dentro de Oscila.

---

# 3. Cálculo y solución paso a paso

## Objetivo del apartado

Explicar cómo Oscila transforma la netlist en una solución física comprobada y comprensible para el estudiante.

## Archivos que se pueden presentar

- `src/pages/Montaje.jsx`
- `src/circuitos/netlist.js`
- `src/circuitos/clasificacion.js`
- `src/circuitos/mna.js`
- `src/circuitos/lineal.js`
- `src/circuitos/reduccion.js`
- `src/circuitos/kirchhoff.js`
- `src/circuitos/mallas.js`
- `src/circuitos/sistemas.js`
- `src/circuitos/pasos.js`
- `src/components/Pasos.jsx`
- `src/components/Tex.jsx`
- `src/circuitos/Esquema.jsx`

## Flujo de cálculo

```text
Netlist
  ↓
Validación
  ↓
Análisis nodal modificado, MNA
  ↓
Clasificación del circuito
  ↓
Reducción o leyes de Kirchhoff
  ↓
Generación de la explicación
  ↓
Verificación contra MNA
  ↓
Pasos.jsx muestra el resultado
```

## A. Validación

`validarNetlist()` comprueba que el circuito sea válido antes de intentar resolverlo.

Verifica, por ejemplo:

- que exista una fuente;
- que existan elementos pasivos;
- que todos los componentes estén conectados;
- que no haya terminales inválidos;
- que la red sea eléctricamente coherente.

## B. Análisis nodal modificado

[src/circuitos/mna.js](src/circuitos/mna.js) contiene el cálculo numérico de referencia.

Su función principal es:

```js
resolverCircuito(net)
```

Calcula:

- potenciales de los nodos;
- voltajes en resistencias y condensadores;
- corrientes;
- potencia;
- carga;
- energía;
- resistencia equivalente;
- capacitancia equivalente.

Para una resistencia utiliza la relación:

$$I = \frac{V_a - V_b}{R}$$

El sistema de ecuaciones se resuelve con `src/circuitos/lineal.js`.

## C. Clasificación

`src/circuitos/clasificacion.js` determina si el circuito es:

- serie;
- paralelo;
- mixto;
- puente;
- no reducible;
- sin fuente.

Esta clasificación permite escoger el método de explicación adecuado.

## D. Reducción serie/paralelo

`src/circuitos/reduccion.js` simplifica el circuito aplicando las reglas físicas correspondientes.

Para resistencias:

$$R_{serie} = R_1 + R_2$$

$$\frac{1}{R_{paralelo}} = \frac{1}{R_1} + \frac{1}{R_2}$$

El sistema conserva un árbol de operaciones para poder regresar desde el equivalente hasta cada resistencia original.

## E. Leyes de Kirchhoff

Cuando el circuito no puede resolverse únicamente por serie y paralelo, se utiliza `src/circuitos/kirchhoff.js`.

Este módulo genera:

- ecuaciones de nodos;
- ecuaciones de mallas;
- variables de corriente;
- signos de voltajes y fuentes.

`src/circuitos/mallas.js` identifica las ventanas del dibujo y `src/circuitos/sistemas.js` resuelve las ecuaciones paso a paso.

## F. Generación de la explicación

[src/circuitos/pasos.js](src/circuitos/pasos.js) coordina el resultado final mediante:

```js
resolverPasoAPaso(net, opciones)
```

Genera bloques de contenido como:

- diagramas;
- fórmulas;
- ecuaciones;
- tablas de resultados;
- comprobaciones físicas.

Después, `src/components/Pasos.jsx` recibe esos bloques y los transforma en la interfaz visible.

`src/circuitos/Esquema.jsx` dibuja los circuitos y `src/components/Tex.jsx` renderiza las fórmulas matemáticas.

## G. Verificación independiente

La plataforma calcula una referencia con MNA y compara los resultados producidos por reducción o Kirchhoff.

La tolerancia utilizada es del 1 %. Si los resultados no coinciden, la solución no se muestra como válida.

## Qué decir durante la presentación

> El motor de Oscila no se limita a calcular un resultado. Primero obtiene una solución numérica de referencia mediante MNA. Luego clasifica el circuito y genera una explicación mediante reducción o leyes de Kirchhoff.

> Finalmente compara ambas soluciones. De esta forma, la explicación que recibe el estudiante no solo es didáctica, sino también verificada numéricamente.

## Demostración sugerida

1. Mostrar un circuito serie sencillo.
2. Mostrar su resistencia equivalente.
3. Mostrar la corriente total.
4. Mostrar el voltaje de cada resistencia.
5. Mostrar la tabla de resultados.
6. Mostrar la comprobación de potencia.
7. Mencionar que un circuito más complejo puede resolverse mediante Kirchhoff.

---

# Cierre de la ponencia

Oscila integra tres niveles:

```text
Interfaz educativa
  ↓
Interpretación visual del circuito
  ↓
Motor matemático verificado
```

La API de Gemini amplía las formas de entrada, porque permite reconocer circuitos desde fotografías. Sin embargo, la decisión matemática permanece en el motor propio de Oscila.

La principal aportación del proyecto es que el estudiante no recibe únicamente un número. Recibe:

- el circuito interpretado;
- el método utilizado;
- las ecuaciones;
- los diagramas intermedios;
- los resultados de cada elemento;
- las comprobaciones físicas.

## Frase final sugerida

> Oscila convierte un circuito dibujado o fotografiado en una experiencia completa de aprendizaje: lo interpreta, lo calcula, lo verifica y explica cada paso de su solución.

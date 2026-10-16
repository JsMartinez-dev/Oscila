# Reglas permanentes del proyecto

## Idioma
- Todo en español: informes, preguntas, explicaciones, comentarios y mensajes de commit sugeridos.

## Git
- **No hacer commit, push ni merge.** Los hace el usuario.
- Una rama por tarea, con nombre descriptivo (por ejemplo `ajuste/…`, `docs/…`, `config/…`). Antes de crearla, `git fetch`; la rama sale de `origin/main`.
- La base es `main`: todos los PR van a `main`. (`feature/electricidad-magnetismo` ya no se usa.)
- Al terminar cada tarea, detenerse y reportar:
  - en qué rama quedó el trabajo;
  - qué archivos cambiaron;
  - qué pruebas se corrieron (`npm test` debe seguir en verde);
  - un mensaje de commit sugerido, en español.
- Esperar a que el usuario haga el commit (y la integración que corresponda) antes de crear la siguiente rama.
- Informar si hubo algún push reciente y a qué rama.

## Archivos que nunca se suben
- `.env.local` (la API key de Gemini) ni ningún otro `.env*` con secretos; solo `.env.example`.
- `docs/referencias/` (capturas de otras aplicaciones usadas como referencia visual).

## Comentarios en el código
- Nada de comentarios largos ni explicativos, ni emojis. Como máximo, separadores cortos del tipo `// Nombre de sección`.

## Imágenes y multimedia
- Toda imagen, GIF o video que no hayamos hecho nosotros lleva su crédito: autor, fuente y licencia.
- Si no se conoce la fuente o la licencia no permite usarla, se reemplaza por una de dominio público o con licencia libre (CC0, CC BY o CC BY-SA; por ejemplo de Wikimedia Commons, NASA, Pixabay o Unsplash) o por un dibujo propio en SVG.
- Nunca inventar ni suponer una licencia: si no se puede verificar, se pone en una lista y se le pregunta al usuario.
- Todo se sirve desde el proyecto (`public/` o `src/`); nada por CDN ni enlazado desde otro sitio, para que la app funcione sin internet.

## Nombre y créditos
- La plataforma se llama **Oscila** (en `package.json`: `oscila`). El laboratorio de Electricidad sigue llamándose "Montaje virtual de circuitos".
- Desarrolladores de Electricidad y Magnetismo, en este orden: Juan Sebastian Martinez, Juan David Rivera y Eduardo Enrique Vergara. Profesor: Jarvin Mestra Páez. Universidad del Magdalena, II Foro Internacional de Física.
- Calor y Ondas conserva los créditos de su equipo original (`src/contenido/calor-ondas/creditos.js`); en modo feria no se muestran.
- Los créditos se editan en un solo lugar: `src/contenido/creditos.js` (portada, página Créditos y PDF del test leen de ahí). Cada imagen nueva debe quedar en el inventario con su crédito; la prueba `src/contenido/creditos.test.js` falla si falta.

## Comandos
- `npm test`: pruebas (Vitest).
- `npm run build`: versión de producción en `dist/`.
- `npm run preview`: sirve `dist/` en http://localhost:4173; con `.env.local` también sirve `/api/reconocer`.
- `npm run dev`: desarrollo en http://localhost:5173.

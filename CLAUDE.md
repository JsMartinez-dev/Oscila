# Reglas permanentes del proyecto

## Idioma
- Todo en español: informes, preguntas, explicaciones, comentarios y mensajes de commit sugeridos.

## Git
- **No hacer commit, push ni merge.** Los hace el usuario.
- Una rama por tarea, con nombre descriptivo (por ejemplo `ajuste/…`, `docs/…`, `config/…`), creada desde la rama base que indique el usuario (por ahora `feature/electricidad-magnetismo`).
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

## Comandos
- `npm test`: pruebas (Vitest).
- `npm run build`: versión de producción en `dist/`.
- `npm run preview`: sirve `dist/` en http://localhost:4173; con `.env.local` también sirve `/api/reconocer`.
- `npm run dev`: desarrollo en http://localhost:5173.

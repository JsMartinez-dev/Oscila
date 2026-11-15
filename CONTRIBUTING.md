# Contribuir a Oscila

## Alcance y acuerdos

Cada tarea tiene un objetivo, una rama y un pull request (PR) hacia `main`. Los commits, el push y la integración los realiza el equipo; el agente prepara los cambios y comunica su validación. No se reescribe el historial para uniformar tareas anteriores.

Se conserva la separación entre motor (`src/circuitos/`), interfaz (`src/components/` y `src/pages/`) y contenido (`src/contenido/`). Electricidad y Magnetismo es el módulo principal; Calor y Ondas sigue en revisión y Mecánica está anunciada.

## Definir la tarea

Describe el problema, el alcance y los criterios de aceptación antes de implementar. Usa un issue cuando necesites discusión, asignación o seguimiento; para un cambio pequeño, basta con dejar esos datos en el PR.

Ejemplo de tarea: «Mostrar un aviso cuando el montaje tenga partes desconectadas». Criterios: identificar el problema antes del cálculo, explicar cómo corregirlo y conservar la validación del motor. Asigna responsables solo después de acordarlo con ellos.

## Crear una rama

Primero revisa `git status` y conserva cualquier trabajo local pendiente. Espera a que el equipo haya hecho el commit y la integración de la tarea anterior antes de iniciar la siguiente. Con el árbol de trabajo limpio:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c fix/aviso-circuito-desconectado origin/main
```

Usa un nombre breve: `feat/` para funcionalidades, `fix/` para defectos, `docs/` para documentación, `refactor/` para reorganización sin cambiar comportamiento, `test/` para pruebas, `ci/` para automatización y `chore/` para mantenimiento. No renombres ramas históricas por estética. Las ramas creadas por Codex llevan el prefijo `codex/`, por ejemplo `codex/ci-validacion-contribucion`.

Una rama resuelve un objetivo coherente. No se reutiliza para tareas nuevas después de integrarla. La base de los PR es `main`; no se introduce `develop` ni se usa `feature/electricidad-magnetismo` como base.

## Implementar y verificar

Para reproducir el entorno de integración continua, usa Node.js 24 y el `package-lock.json` del repositorio:

```bash
npm ci
npm test
npm run build
```

`npm ci` instala las versiones del lockfile y reemplaza `node_modules`; requiere acceso al registro o una caché suficiente. No cambies dependencias ni el lockfile si la tarea no lo necesita. Para revisar la aplicación, usa `npm run dev` o, tras compilar, `npm run preview`.

Registra resultados de esta ejecución, sin presentar cifras históricas como actuales. Si cambia la interfaz, comprueba el flujo afectado y adjunta capturas. Las pruebas automáticas no sustituyen la revisión visual ni la demostración sin conexión.

El motor conserva las convenciones del curso, el alcance DC en estado estacionario y la verificación independiente con MNA al 1 %, incluido el bloqueo por discrepancias. Gemini interpreta fotografías; el usuario revisa el circuito reconocido y el motor propio calcula.

No subas secretos ni `docs/referencias/`. Usa `.env.example` para documentar variables y mantén `GEMINI_API_KEY` en el servidor. Los recursos de la demostración deben ser locales; al incorporar recursos ajenos, registra autor, fuente y licencia comprobados en los inventarios de créditos.

## Commits y pull request

El equipo crea commits coherentes y descriptivos en español con el formato `tipo(alcance): descripción`, por ejemplo:

```text
fix(montaje): explicar las partes desconectadas antes de calcular
ci: validar pruebas y compilación en los pull requests
```

Revisa el diff y selecciona los archivos de la tarea antes de hacer commit; evita incluir cambios locales ajenos. Después, publica esa rama y abre un PR hacia `main`. Puedes abrirlo en borrador para recibir comentarios mientras trabajas.

Usa un título que describa el resultado y completa la [plantilla de PR](.github/pull_request_template.md): problema y cambio, issue si existe, validación actual, capturas y riesgos. Añade `Closes #numero` solo si el PR resuelve completamente ese issue.

## Revisar e integrar

Solicita al menos una aprobación de otro integrante. La revisión comprueba el alcance, el comportamiento, la claridad, la física cuando corresponda y la evidencia de validación. Responde los comentarios y actualiza la misma rama; los cambios relevantes posteriores a una aprobación deben volver a revisarse.

El equipo integra mediante **merge commit**, conservando los commits de la rama. Antes de integrar, comprueba la aprobación, las conversaciones resueltas y el resultado correcto de la validación automática. Si falla, corrige la causa y vuelve a ejecutar; no omitas la comprobación para integrar.

Después del merge, el equipo puede eliminar la rama remota integrada si nadie mantiene trabajo pendiente en ella. Para actualizar la copia local, con el árbol de trabajo limpio:

```bash
git switch main
git pull --ff-only origin main
git fetch --prune origin
```

## Validación automática y configuración pendiente

El [workflow de validación](.github/workflows/validacion.yml) está preparado para ejecutar `npm ci`, `npm test` y `npm run build` con Node.js 24 en Ubuntu. Se activa en PR hacia `main`, en push a `main` y de forma manual cuando esté disponible en la rama predeterminada. También valida PR que solo cambian documentación: no tiene filtros por rutas. No necesita una clave de Gemini; las pruebas de reconocimiento simulan las respuestas del servicio.

Este archivo no configura las reglas del repositorio. Después de publicar el primer PR y comprobar una ejecución correcta en GitHub Actions, un administrador debe configurar y verificar:

- PR obligatorio hacia `main`, con una aprobación de otra persona y nueva revisión de cambios posteriores.
- Resolución de conversaciones y la comprobación `Pruebas y compilación` obligatorias, seleccionando el nombre que muestre la ejecución real.
- Bloqueo de force push y eliminación de `main`, aplicando las reglas también a administradores cuando corresponda.
- Eliminación automática de ramas integradas, tras acordarlo con el equipo.

Hasta verificar esos ajustes en GitHub, son requisitos del equipo y configuración pendiente, no protecciones activadas por este cambio. Revisa qué integraciones de Vercel siguen siendo necesarias antes de exigir sus estados. La limpieza de ramas antiguas y los cambios de configuración se realizan aparte, sin borrar trabajo pendiente.

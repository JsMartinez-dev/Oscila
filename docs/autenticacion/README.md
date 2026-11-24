# Renovación de autenticación de Oscila

## Decisión y alcance

El usuario eligió el 23 de noviembre de 2026 **conservar Supabase Auth con SMTP propio y añadir Google**. Se mantiene la confirmación por correo para email/contraseña. No hay migración de proveedor, cambio de UUID, exportación de contraseñas ni eliminación de cuentas o datos. Google se ofrece solo con `VITE_AUTH_GOOGLE=true`, después de configurar el proveedor en Supabase. Este interruptor controla la interfaz; no activa Google en el servidor.

Supabase sigue gestionando contraseñas, tokens, renovaciones, verificación y recuperación. SMTP solo sustituye el transporte. Google verifica la identidad en su flujo OAuth; con una identidad verificada no se necesita el correo de confirmación de Oscila. Las cuentas de contraseña siguen dependiendo de SMTP para confirmación y recuperación. No hay envío propio desde React ni credenciales SMTP/OAuth administrativas en Vite.

## Diagnóstico y evidencia actual

Se revisaron `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `Cuenta.jsx`, `Cuenta.css`, `supabase.js`, `App.jsx`, todos los usos de Auth/sesión/metadatos, el almacenamiento local, la API y el contenido de `supabase/` y `docs/correo-confirmacion/`. No se encontraron archivos `AGENTS.md` en el proyecto ni en los directorios ascendientes revisados. Git estaba limpio; se ejecutó `git fetch origin` y se creó `feat/renovar-autenticacion` desde `origin/main`. La personalización del correo ya está en esa base; no se reutilizó una rama anterior.

Consulta real y de solo lectura a `/auth/v1/settings` del proyecto de `.env.local`, el 23 de noviembre de 2026:

| Ajuste observable | Resultado |
| --- | --- |
| Respuesta | HTTP 200 |
| Registro | Habilitado |
| Email/contraseña | Habilitado |
| Confirmación del correo | Requerida |
| Google | Deshabilitado en el proveedor remoto |
| SMTP, asunto/HTML alojados, cuotas personalizadas, logs y usuarios | No observables con la clave pública |

La primera consulta falló bajo las restricciones de red; la consulta autorizada fuera del sandbox obtuvo esos resultados. Para repetirla sin imprimir la URL, la clave, usuarios o respuestas privadas: `node scripts/auth/diagnostico.mjs`. No realiza altas, login, recuperación ni envíos.

El texto reportado era una traducción local de `over_email_send_rate_limit` en `Cuenta.jsx`. No constituye un diagnóstico de la cuota concreta ni evidencia de que baste esperar unos minutos. Que falle con personas distintas es **compatible con una cuota de proyecto agotada**, pero no demuestra que el SMTP integrado siga activo. No se intentó provocar el límite real ni enviar un correo para averiguarlo.

| Posible causa | Cómo distinguirla sin enviar correos adicionales |
| --- | --- |
| Cuota global de correo | Revisar SMTP y Rate Limits del proyecto y Auth Logs del intervalo del incidente. El integrado publica 2 correos/hora por proyecto, compartidos entre endpoints de envío. Distintos destinatarios también consumen esa cuota. |
| Espera por destinatario | Revisar intervalo y destinatario de las solicitudes en privado. Registro y recuperación publican una ventana predeterminada de 60 s para la misma persona, configurable. No se convierte ese valor predeterminado en una cuenta atrás de la interfaz. |
| Solicitudes por IP | `over_request_rate_limit` indica límites del cliente/red. La documentación consultada publica 30 solicitudes/5 min para altas y endpoints de envío, y 150/5 min para `/token`, con ráfagas de hasta 30. Un aula puede compartir IP pública. |
| Solicitudes duplicadas | El código anterior llamaba una vez a Auth por envío y no registraba desde un efecto; usaba estado React como bloqueo. Eso deja una ventana antes del render. Ahora un cierre síncrono compartido bloquea registro/login/reenvío/recuperación/Google simultáneos. La prueba en navegador dispara dos envíos y observa una sola petición de alta simulada. |
| Restricción del proveedor | `email_address_not_authorized` corresponde al correo integrado limitado al equipo. Revisar también remitente/dominio, DNS, SMTP, cuota del proveedor, rebotes y logs. Fallos de red o de servidor no se presentan como contraseña incorrecta. |

Para cerrar el diagnóstico operativo, un administrador debe correlacionar fecha/hora del incidente, endpoint, estado HTTP, código y número de solicitudes con Auth Logs y el proveedor. No compartir contraseñas, cabeceras Authorization/apikey, tokens, enlaces de un solo uso ni direcciones personales en capturas. Si la respuesta ofrece un plazo real, registrarlo para soporte; la app no tiene acceso garantizado a ese dato mediante `AuthError` y no inventa una espera.

## Comparación de alternativas

Valores oficiales consultados el 23 de noviembre de 2026, expresados en USD cuando corresponde. No son cuotas comprobadas del proyecto; pueden cambiar.

| Alternativa | Ventaja y coste de transición | Límites, costes y requisitos |
| --- | --- | --- |
| Supabase Auth + SMTP propio | Mantiene UUID, sesiones, claves y flujo existente. Resuelve la dependencia del SMTP integrado. | Supabase aplica inicialmente 30 correos/h con SMTP propio; ajustar Rate Limits al aforo y cuota contratada. Persisten ventanas por destinatario/IP y controles de abuso. Resend es un ejemplo compatible: Free publica 3.000/mes y 100/día; Pro, 20 USD/mes por 50.000, más exceso. Dominio/remitente verificados; el registro del dominio puede tener coste. No se ha contratado un proveedor. |
| Google OAuth en Supabase | Acceso adicional que evita el correo de Oscila para ese flujo verificado. No requiere migrar cuentas. | Requiere cliente web, secreto en Supabase, callback, consentimiento, audiencia y dominios. Testing o restricciones de Workspace pueden limitar participantes. Consume usuarios activos de Supabase y conserva controles de Google/Auth. Supabase Free publica 50.000 MAU; Pro desde 25 USD/mes incluye 100.000 y luego 0,00325 USD/MAU. No se declara un coste independiente de Google ni gratuidad universal. |
| Firebase Authentication / Identity Platform | Alternativa administrada con email/contraseña y Google. Mayores cuotas de correo publicadas, con trabajo de transición. | Firebase publica 100 nuevas cuentas/h/IP; Spark: 1.000 correos de verificación/día y 150 de recuperación/día; Blaze: 100.000 y 10.000 respectivamente. Identity Platform cobra por MAU: email/social tienen un primer tramo de 50.000 sin cargo; el siguiente cuesta 0,0055 USD/MAU. Depende de plan, facturación, cuotas y servicios usados; no equivale a un proyecto completo gratuito. |

Se descartó la migración para esta entrega porque el problema puede resolverse conservando el proveedor. No se eliminó la verificación del correo.

## Identidad, datos y compatibilidad

| Consumidor o dato | Estado y conservación |
| --- | --- |
| `src/components/Cuenta.jsx` | Alta, login, reenvío, recuperación, cambio de clave y Google delegados a Supabase. `full_name` y `terms_accepted` del registro por correo se conservan. |
| `src/App.jsx` | Escucha `onAuthStateChange`, bloquea la plataforma sin sesión y separa `PASSWORD_RECOVERY`. Cierra la sesión local mediante Supabase. Muestra `full_name`, luego `name`, correo o texto neutro. Los metadatos son presentación, no autorización. |
| `src/servicios/supabase.js` y `almacenSesion.js` | Mismo cliente y claves de almacenamiento de Supabase; lectura de sesiones anteriores. Sin recordar usa sessionStorage; con recordar, localStorage. La elección sobrevive a la redirección OAuth. Salir retira la clave de ambos almacenes; con almacenamiento bloqueado usa memoria. Solo tokens gestionados por Supabase; ninguna contraseña se persiste. |
| Montajes y contenido | Los montajes guardados son archivos compartidos del repositorio, no filas por usuario. No se encontraron llamadas `.from()` ni Storage de Supabase en los consumidores. |
| Preferencias/caché | Tema, modo feria y contador diario son locales al navegador; IndexedDB conserva reconocimientos por hash. No están asociados a UUID y no se cambian. Usar otro usuario en el mismo equipo no los convierte en datos privados por cuenta. |
| API de reconocimiento | No consume la sesión en el código actual. La barrera de interfaz no es una política de autorización de servidor. No se modifica esta función ni el motor de circuitos. |
| Usuarios y RLS alojados | Inventario **no verificado**: no hay acceso administrativo de Supabase entre las herramientas conectadas. No se deduce que no existan tablas, políticas o usuarios remotos por su ausencia en Git. |

Antes de activar el flujo para producción, ejecutar privadamente [`supabase/auditoria-autenticacion.sql`](../../supabase/auditoria-autenticacion.sql), que solo hace SELECT y termina con rollback. Revisa cantidades, proveedores, claves foráneas, columnas de propietario y políticas RLS, incluidos Storage y otros esquemas. Comparar una cuenta existente antes/después: mismo UUID, metadatos, relaciones y acceso permitido/denegado a datos propios/ajenos. No guardar resultados personales en Git. El script es un punto de partida: buscar también referencias lógicas sin FK y funciones/triggers del esquema real. No se ejecutó contra el proyecto.

Supabase puede vincular automáticamente identidades con el mismo correo bajo sus reglas de verificación. No implementamos vinculación por comparar correos en React, ni fusionamos cuentas con direcciones distintas. Para una cuenta existente confirmada, comprobar en staging que Google conserva el UUID; revisar especialmente cuentas sin confirmar y las reglas del proveedor, pues Supabase puede retirar identidades no confirmadas durante la vinculación. El nombre de Google procede del proveedor y no sustituye permisos. El checkbox del registro por correo conserva su metadato; la pantalla de Google no crea un registro administrativo de aceptación de términos.

Si en el futuro se decide migrar a Firebase, antes de cambiar producción:

1. Inventariar privadamente cuentas, proveedores, estado de verificación, UUID y todas las relaciones de propiedad; respaldar configuración, políticas y datos. Mantener el proyecto anterior operativo.
2. Definir el UID destino o una tabla privada de correspondencia de UUID a UID, evitando duplicados y colisiones. No enlazar cuentas por correo sin prueba de control. Adaptar RLS/claims al emisor y tipo de UID; un UID externo no debe suponerse compatible con `auth.uid()` ni con columnas UUID.
3. No exportar contraseñas en texto ni presumir que el panel permite migrarlas. Firebase admite ciertos hashes (incluido BCRYPT), pero la disponibilidad y compatibilidad del hash del origen deben verificarse en un proceso administrativo seguro y un piloto. Si no se puede, acordar recuperación/invitación o acceso Google con verificación, sin pérdida de propiedad.
4. No reutilizar tokens ni refresh tokens entre proveedores. Planificar nuevo login, periodo de coexistencia acotado y recuperación dirigida al proveedor correcto; conservar válido el flujo anterior durante la transición acordada.
5. Probar cuentas antiguas y nuevas, autorización propia/ajena, UUID/UID, caducidad y rollback antes de cambiar tráfico. No borrar usuarios o proyectos como parte del cambio.

## Configuración de desarrollo y producción

### Variables del navegador

| Variable | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del mismo proyecto de Supabase; conservarla para mantener identidad y sesiones. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del mismo proyecto, nunca service_role ni clave administrativa. |
| `VITE_AUTH_GOOGLE` | `false` por defecto; `true` muestra Google. Reiniciar Vite o recompilar/desplegar tras cambiarla. No prueba que el proveedor remoto esté activo. |

Copiar las variables de `.env.example` a `.env.local` para desarrollo; en producción configurarlas en Vercel y redesplegar. No se modificó `.env.local`. Usar un proyecto separado para pruebas cuando se disponga de él.

### SMTP y confirmación

1. Elegir proveedor SMTP y capacidad según aforo, incluyendo altas, reenvíos y recuperaciones. Como ejemplo, verificar con Resend el dominio propio, SPF/DKIM y demás DNS solicitados. El dominio `*.vercel.app` del despliegue no concede control de DNS para autenticar un remitente propio.
2. En Supabase → Authentication → Email/SMTP, configurar Custom SMTP: host, puerto, usuario, contraseña y remitente autorizado con nombre Oscila. Seguir los valores oficiales de la cuenta contratada. **No** escribirlos en React, `.env.example`, variables `VITE_` ni Git.
3. En Rate Limits, revisar la cuota inicial de SMTP y adecuarla a la capacidad real del proveedor y a usuarios que compartan IP; no desactivar controles de abuso indiscriminadamente. Mantener **Confirm email** habilitado.
4. Configurar Site URL de producción y Redirect URLs exactas de desarrollo/producción, por ejemplo `http://localhost:5173/` y `https://oscila.vercel.app/` si siguen siendo los dominios usados. Evitar comodines amplios para producción; autorizar por separado las vistas previas necesarias. Si cambia BASE_URL, autorizar el destino resultante con su barra final.
5. Comparar asunto y HTML alojados con [`confirmacion-registro.html`](../../supabase/templates/confirmacion-registro.html). Guardar antes una copia privada de lo alojado. Si falta aplicar, seguir [`correo-confirmacion`](../correo-confirmacion/README.md). El archivo ya utiliza `full_name` con escape de Go y `.ConfirmationURL`; sigue siendo correcto con SMTP propio. Google no usa esa plantilla para su flujo normal verificado. Desactivar reescritura/seguimiento de enlaces de Auth en el proveedor.
6. Revisar también el correo de recuperación y su redirección; esta tarea no sustituye su plantilla alojada. Solicitar al usuario un destinatario concreto antes de cualquier envío de prueba.

### Google OAuth

1. En Google Auth Platform crear/configurar un proyecto y un cliente OAuth **Web application**. Configurar marca, audiencia, contacto y consentimiento, sin ampliar scopes a servicios ajenos al acceso básico. Seguir los requisitos de verificación que Google indique para la configuración real.
2. Autorizar los orígenes de Oscila y desarrollo que correspondan. Como URI de redirección de Google usar el callback exacto que muestra Supabase, normalmente `https://<referencia>.supabase.co/auth/v1/callback`, **no** la portada de Oscila. Para una instancia local de Supabase el callback oficial es `http://127.0.0.1:54321/auth/v1/callback`.
3. En Supabase → Authentication → Sign In/Providers → Google, habilitar Google y guardar Client ID y Client Secret. El secreto se queda allí. No deshabilitar la verificación de nonce como atajo.
4. Configurar también las Redirect URLs de Oscila en Supabase. En modo Testing autorizar los usuarios de prueba y comprobar las restricciones de la audiencia/Workspace; para acceso público completar la publicación exigida por Google.
5. Tras verificar el proveedor, establecer `VITE_AUTH_GOOGLE=true`, reiniciar/recompilar y validar el flujo real con una persona autorizada. `prompt=select_account` facilita que personas consecutivas elijan cuentas distintas; no cierra su sesión general de Google. Para una cuenta creada solo con Google, continuar con Google; la contraseña/recuperación solo aplica cuando tenga una contraseña configurada por el proveedor.

### Puesta en marcha y reversión

No se necesita migración SQL. Mantener URL, clave pública y confirmación existentes. Registrar de forma privada configuración antes/después. Ante un problema OAuth, desactivar `VITE_AUTH_GOOGLE` y redesplegar; email/contraseña siguen disponibles si SMTP funciona. Restaurar la configuración del proveedor/plantilla desde su copia privada si corresponde, sin borrar cuentas ni datos. Volver al SMTP integrado reintroduciría sus restricciones y no es una solución de capacidad.

## Validación reproducible

```powershell
npm test
npm run build
node scripts/auth/diagnostico.mjs
node scripts/auth/navegador.mjs
$env:OSCILA_QA_SIN_GOOGLE='1'
node scripts/auth/navegador.mjs
Remove-Item Env:OSCILA_QA_SIN_GOOGLE
```

El navegador requiere Node.js 24 y Chrome; `CHROME_PATH` permite indicar otro Chromium. Levanta Vite y un proveedor **simulado** en puertos de loopback, fuerza URL/clave ficticias y Google en la compilación de prueba, usa perfil temporal y bloquea resolución de dominios externos. No usa sesiones personales, no conecta con Supabase real y no envía correos. No añade dependencias ni cambia el lockfile. Las credenciales ficticias solo se usan en memoria para las pruebas.

Resultados del 23 de noviembre de 2026:

- `npm test`: 8 archivos, 143 pruebas aprobadas; incluye 24 nuevas de acciones de Auth, duplicados, mensajes y almacenamiento compatible.
- `npm run build`: correcto. Permanece la advertencia de bundles mayores de 500 kB; no hubo cambios de dependencias ni del motor para atenderla.
- Prueba de navegador con Google: aprobada; registro consecutivo, doble envío bloqueado, campos vacíos para la siguiente persona, reenvío, errores de cuota/correo no autorizado/credenciales/no confirmado/IP, recuperación, contraseña nueva y enlace vencido, login y recarga con ambas persistencias, logout sin tokens residuales, barrera de navegación sin sesión, Google y cancelación con limpieza del error de URL.
- Prueba de navegador sin Google: aprobada; botón oculto.
- Capturas a 1366, 390 y 320 px, sin desbordamiento horizontal. [Resultados medidos](validacion.json) y [sin Google](validacion-sin-google.json). Son pruebas de la aplicación real con respuestas simuladas, no evidencia de autenticación real.
- Revisión visual de las nueve capturas: marca, formularios, botones, mensajes y pie legibles; a 320 px el texto se distribuye en varias líneas y el contenido sigue disponible mediante desplazamiento vertical.
- El primer arranque de Chrome bajo el sandbox no inició; la ejecución autorizada funcionó. Se corrigió el simulador para declarar la versión de API de Supabase y forzar recargas completas en pruebas de enlaces.

Capturas: [ingreso escritorio](capturas/ingreso-escritorio.png), [ingreso móvil](capturas/ingreso-movil.png), [registro escritorio](capturas/registro-escritorio.png), [registro móvil](capturas/registro-movil.png), [registro 320 px](capturas/registro-320.png), [confirmación](capturas/confirmacion-escritorio.png), [límite de correo](capturas/limite-correo-movil.png), [recuperación](capturas/recuperacion-movil.png) y [Google deshabilitado](capturas/sin-google.png).

## Pendientes externos exactos

- Acceso administrativo para verificar inventario de cuentas, datos/RLS, logs, cuotas efectivas, SMTP y plantilla alojada. La documentación anterior decía que faltaba activación/envío; hoy no hay evidencia administrativa que permita ratificarlo ni darlo por realizado.
- Proveedor SMTP elegido por el equipo, cuenta, dominio DNS controlado, remitente y credenciales; configurar y comprobar cuotas y transporte en Supabase y proveedor.
- Proyecto/cliente Google, consentimiento/audiencia, callback, secreto y activación remota. La consulta actual confirmó Google deshabilitado; no se cambió ese ajuste.
- Variables y redirects de desarrollo/producción; habilitar el interruptor de interfaz después de verificar Google y redesplegar.
- Destinatario indicado por el usuario para un ensayo real. No se envió ningún correo ni se afirma recepción, confirmación, login u OAuth real.
- Piloto real con cuentas existentes y nuevas: mismo UUID y propiedad, email/password y Google, reenvío, recuperación, cierre, recarga y registro de varias personas dentro de cuotas acordadas; pruebas de acceso propio/ajeno según RLS real. Recoger evidencia sin datos personales ni tokens.

## Fuentes oficiales

Consultadas el 23 de noviembre de 2026:

- [Supabase: límites de Auth](https://supabase.com/docs/guides/auth/rate-limits), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [códigos de error](https://supabase.com/docs/guides/auth/debugging/error-codes), [precios](https://supabase.com/pricing).
- [Supabase: Google](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [vinculación de identidades](https://supabase.com/docs/guides/auth/auth-identity-linking), [plantillas](https://supabase.com/docs/guides/auth/auth-email-templates).
- [Resend: precios](https://resend.com/pricing) y [SMTP](https://resend.com/docs/send-with-smtp).
- [Firebase: límites](https://firebase.google.com/docs/auth/limits), [importación de usuarios](https://firebase.google.com/docs/auth/admin/import-users), [Identity Platform: precios](https://cloud.google.com/identity-platform/pricing).
- [Google: configuración OAuth y consentimiento](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred).

## Archivos de la entrega y propuesta de PR

- Interfaz y sesión: `src/components/Cuenta.jsx`, `src/components/Cuenta.css`, `src/App.jsx`, `src/servicios/supabase.js`, `src/servicios/autenticacion.js` y `src/servicios/almacenSesion.js`.
- Pruebas: `src/servicios/autenticacion.test.js`, `src/servicios/almacenSesion.test.js` y `scripts/auth/navegador.mjs`.
- Diagnóstico y auditoría: `scripts/auth/diagnostico.mjs` y `supabase/auditoria-autenticacion.sql`.
- Configuración y documentación: `.env.example`, `README.md`, `docs/correo-confirmacion/README.md`, este documento y `docs/autenticacion/PR.md`.
- Evidencias: `docs/autenticacion/validacion.json`, `validacion-sin-google.json` y nueve PNG bajo `docs/autenticacion/capturas/`.
- Plantilla existente revisada y conservada: `supabase/templates/confirmacion-registro.html`; no necesita alterar el HTML para usar SMTP propio.

Rama: `feat/renovar-autenticacion`, desde `origin/main` en `40c6aad` (merge de la personalización del correo). Inicialmente se preparó sin commit ni push; el usuario autorizó después ambas acciones y decidió detener la configuración externa para que la revise su compañero. No se autoriza merge. El historial consultado confirma el merge anterior; no demuestra cuándo se hizo su push.

Entrega para el compañero: [revisión de Supabase, piloto y confirmación de capacidad](REVISION-SUPABASE.md). La revisión del navegador encontró el panel sin sesión iniciada; no se cambiaron ajustes externos.

Título de PR sugerido: **Renovar el acceso con Google opcional y preparar el registro con SMTP propio**. [Descripción propuesta](PR.md). Mensaje de commit sugerido para el equipo: `feat(auth): renovar registro y acceso con Google opcional`.

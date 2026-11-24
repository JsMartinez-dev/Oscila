# Confirmación de registro de Oscila

## Arquitectura y alcance

El registro de `src/components/Cuenta.jsx` delega en `src/servicios/autenticacion.js`, que llama a `supabase.auth.signUp`: el nombre llega como `options.data.full_name` y la redirección como `options.emailRedirectTo`. Supabase Auth envía su único correo de confirmación. Esta plantilla entrega el asunto y HTML para sustituir **Confirm sign up**; no instala un hook, una función de envío ni un segundo correo.

La arquitectura elegida es **Supabase Auth con SMTP propio y Google opcional**; consulta [la documentación de autenticación](../autenticacion/README.md). Esta plantilla sigue vigente para email/contraseña y reenvío de confirmación; el flujo normal de Google con identidad verificada no la necesita. El HTML conserva `.ConfirmationURL` y el escape del nombre, por lo que no requiere cambios de cuerpo para sustituir el transporte.

- Asunto: **Confirma tu correo y empieza con Oscila**.
- HTML para copiar completo: [`supabase/templates/confirmacion-registro.html`](../../supabase/templates/confirmacion-registro.html).
- Logo existente: `public/logotipos/LOGOTIPO-NOMBRE.png`, publicado en [Oscila](https://oscila.vercel.app/logotipos/LOGOTIPO-NOMBRE.png). Verificado el 23 de noviembre de 2026: HTTP 200, `image/png`, 322107 bytes. Se utiliza PNG, no SVG, con URL HTTPS absoluta del dominio publicado del proyecto. No hay fuentes ni imágenes de terceros.
- Colores tomados de `src/estilos/tokens.css`: morado `#2e1a47`, lila `#b989ed`, tinta `#160b26` y superficies claras. Tablas de presentación, fuentes del sistema y estilos en línea. La marca, la acción y las instrucciones siguen como texto cuando no se carga el logo.

## Variables y seguridad

`{{ if .Data.full_name }}Hola, {{ .Data.full_name }}.{{ else }}Hola.{{ end }}` usa el metadato oficial `.Data`; el nombre ausente, vacío o nulo produce el saludo neutro. El nombre se inserta únicamente en un nodo de texto y nunca se convierte a HTML confiable. Supabase emplea `html/template` de Go y aplica escape contextual automáticamente; no se debe preescapar el nombre en React ni añadir funciones que desactiven el escape.

El botón, el destino del enlace alternativo y su texto usan `{{ .ConfirmationURL }}`. No se reconstruye la URL con `.SiteURL`, `.RedirectTo`, `.Token` o `.TokenHash`. Así Supabase conserva la verificación y la redirección ya configuradas. El escape de `&` como `&amp;` es propio del HTML y conserva el destino al abrir el enlace. El enlace completo solicitado contiene el valor de verificación generado por Supabase; no se muestran OTP ni tokens separados y no se deben registrar enlaces reales en capturas o archivos.

No hay contraseñas, correo del destinatario, claves administrativas, credenciales SMTP, plazos inventados, direcciones de soporte ni políticas nuevas en la plantilla. Los metadatos son datos de presentación, no permisos de autorización.

## Activar en un proyecto alojado

1. Acceder al proyecto correcto en el panel de Supabase con una cuenta autorizada. Guardar una copia privada del asunto y HTML actuales para poder restaurarlos.
2. En **Authentication → Email → Templates** (la ubicación puede aparecer como **Email Templates**), abrir exclusivamente **Confirm sign up**.
3. Pegar el asunto indicado y todo el archivo HTML; revisar la vista previa y guardar. No modificar recuperación, invitaciones, magic links ni los demás correos.
4. En el proveedor **Email**, comprobar que **Confirm email** esté habilitado. En **Authentication → URL Configuration**, revisar **Site URL** y la lista **Redirect URLs** sin sustituir las redirecciones existentes. El registro ya proporciona `emailRedirectTo`.
5. Abrir el logo por HTTPS sin iniciar sesión y confirmar que se sirve una imagen PNG, también después de futuros despliegues. Si cambia el dominio de Oscila, publicar el mismo recurso en el nuevo dominio propio, verificarlo y actualizar el `src` antes de guardar la plantilla.
6. Realizar la prueba de registro con el destinatario que indique el responsable del proyecto. El repositorio por sí solo no cambia la configuración de Supabase alojado. No se configura un stack local de Supabase para esta tarea.

Como alternativa administrativa, los campos de la Management API son `mailer_subjects_confirmation` y `mailer_templates_confirmation_content` en `PATCH /v1/projects/{ref}/config/auth`. Este trabajo no ejecuta esa llamada. Un token de administración se usa exclusivamente en un entorno administrativo seguro, nunca en variables `VITE_*`, código del navegador ni Git.

## Plantilla, remitente y transporte

| Capa | Dónde se configura | Qué requiere |
| --- | --- | --- |
| Asunto y cuerpo | Panel de Supabase, **Confirm sign up** | Copiar el asunto y HTML anteriores. Cambia este correo, no el remitente. |
| Remitente visible | Configuración **Custom SMTP** de Supabase | Nombre sugerido: `Oscila`. La dirección debe proporcionarla el equipo y estar autorizada por su proveedor; no se inventa una dirección. |
| Transporte | Proveedor SMTP y **Custom SMTP** en Supabase | Host, puerto, usuario y contraseña del proveedor; dominio y remitente verificados, con los registros DNS que indique el proveedor. Guardar credenciales únicamente en la configuración administrativa. |

El SMTP predeterminado de Supabase está destinado a pruebas y restringe los destinatarios a miembros autorizados del equipo del proyecto. Para registro público se necesita SMTP propio. Cambiar el HTML no elimina estas restricciones ni garantiza recepción o entrega en la bandeja principal. Configurar SMTP o remitente puede afectar el transporte de todos los correos de Auth, aunque solo se cambie esta plantilla.

Desactivar el seguimiento de enlaces en el proveedor SMTP para evitar que reescriba enlaces de autenticación. Los filtros que abren enlaces antes del usuario pueden consumir enlaces de un solo uso; si ocurre, investigar con el proveedor antes de cambiar el mecanismo de confirmación.

## Reproducir la vista previa y validar el escape

Requiere Go instalado solo para estas herramientas de desarrollo; la aplicación continúa usando sus dependencias actuales de Node. Ejecutar desde la raíz:

```powershell
go run scripts/correo/main.go
Push-Location scripts/correo
go test -v main.go main_test.go
Pop-Location
node scripts/correo/capturas.mjs
npm test
npm run build
```

La captura requiere Node.js 24 y Chrome instalado. Para otro ejecutable compatible, definir `CHROME_PATH` (por ejemplo, el de Edge). El script inicia un navegador headless con un perfil temporal propio, emula los anchos exactos y no utiliza sesiones personales. Guarda las capturas y `validacion.json`; comprueba el ancho real, la ausencia de desbordamiento, la carga o bloqueo efectivo del PNG y la igualdad de los destinos. No añade paquetes a Node ni modifica el lockfile.

El generador usa el mismo motor `html/template`, sin imitarlo con reemplazos en JavaScript. Todas las vistas contienen un enlace ficticio bajo `example.invalid`, sin credenciales ni tokens utilizables. No pulsar enlaces reales para tomar capturas.

- [`vistas/con-nombre.html`](vistas/con-nombre.html): Ana Milena Pérez.
- [`vistas/sin-nombre.html`](vistas/sin-nombre.html): metadato ausente, saludo neutro.
- [`vistas/nombre-no-confiable.html`](vistas/nombre-no-confiable.html): intento de inyección tratado como texto.
- [`vistas/sin-imagenes.html`](vistas/sin-imagenes.html): simulación reproducible del logo bloqueado mediante texto alternativo. La prueba de bloqueo real de red se registra aparte en la validación.

Las pruebas de Go comprueban nombre presente, ausente, vacío y nulo; escape de etiquetas, comillas y ampersand; e igualdad del destino del botón, enlace alternativo y URL visible después del escape HTML. Las capturas de navegador no equivalen a pruebas dentro de Gmail.

## Resultado local del 23 de noviembre de 2026

| Validación | Resultado |
| --- | --- |
| `npm test` | 6 archivos, 119 pruebas aprobadas. |
| `npm run build` | Correcto; Vite advierte de bundles mayores de 500 kB. |
| Pruebas de Go | 2 pruebas aprobadas, con casos de saludo, escape y enlace. |
| Capturas y comprobaciones DOM | 6 casos aprobados; sin desbordamiento a 320, 390 y 960 px. |
| Logo remoto | Cargó en los casos normales; ancho natural 2170 px. Con bloqueo real de red, ancho natural 0 y marca alternativa legible. |
| Revisión visual | Se revisaron las seis capturas. Nombre malicioso visible como texto; no se creó una segunda imagen. |

Las primeras ejecuciones de Node fallaron por las restricciones de lectura de esbuild dentro del sandbox; las ejecuciones posteriores autorizadas fuera del sandbox finalizaron correctamente. Go se descargó desde su sitio oficial en `C:/RTEMP/oscila-correo-runtime`, verificando el SHA-256 publicado; no se instaló como dependencia de la aplicación.

Capturas: [escritorio](capturas/escritorio.png), [sin nombre](capturas/sin-nombre.png), [móvil 390 px](capturas/movil.png), [móvil 320 px](capturas/movil-320.png), [imágenes bloqueadas](capturas/imagenes-bloqueadas.png) y [nombre no confiable](capturas/nombre-no-confiable.png). Datos medidos: [`validacion.json`](validacion.json).

## Estado de la prueba real

La sección siguiente registra el estado histórico de la tarea del correo. En la revisión de autenticación del 23 de noviembre de 2026 se comprobó mediante los ajustes públicos que email y registro están activos, confirmación requerida y Google deshabilitado. La clave pública **no permite verificar SMTP, asunto/HTML alojados ni envíos previos**. Por tanto, su activación y envío anteriores quedan actualmente **sin verificar**; no se asumen pendientes ni realizados por lo que dice este registro histórico. No se envió un nuevo correo. Comparar la configuración administrativa antes de copiar la plantilla otra vez.

Sin una sesión administrativa de Supabase disponible y sin un destinatario indicado, no se ha activado la plantilla ni enviado, recibido o confirmado ningún correo real. El responsable debe:

1. Completar la configuración anterior y comprobar el transporte disponible; si se usa el predeterminado, el destinatario de prueba debe estar autorizado por Supabase.
2. Registrar una cuenta nueva desde Oscila con el nombre de prueba y el correo expresamente indicado. No reutilizar una cuenta confirmada para demostrar el envío de registro.
3. Comprobar asunto, remitente, saludo, logo, enlace alternativo y texto en Gmail de escritorio y móvil, con imágenes permitidas y bloqueadas. Verificar que solo llegue un correo de confirmación.
4. Abrir el enlace recibido, verificar que confirma la cuenta y devuelve al destino permitido de Oscila; iniciar y cerrar sesión. La prueba consume ese enlace.
5. Registrar el resultado con evidencia sin datos personales, credenciales ni enlaces reales. Si falla, restaurar solo asunto y cuerpo desde la copia guardada, manteniendo el resto de Auth.

## Fuentes oficiales consultadas

Consulta: 23 de noviembre de 2026.

- [Plantillas y variables de Supabase](https://supabase.com/docs/guides/auth/auth-email-templates).
- [SMTP propio y restricciones del servicio predeterminado](https://supabase.com/docs/guides/auth/auth-smtp).
- [Motor de plantillas de Supabase Auth](https://github.com/supabase/auth/blob/master/internal/mailer/templatemailer/template.go): importación de `html/template` y ejecución del cuerpo con los datos del correo.
- [Escape contextual de Go](https://pkg.go.dev/html/template).

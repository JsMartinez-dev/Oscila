# Revisión del compañero con acceso a Supabase

Esta entrega prepara el código; no activa SMTP ni Google en el proyecto alojado. La configuración externa queda a cargo del compañero con acceso a Supabase. El agente no ha realizado envíos ni autenticación real. El usuario aportó una captura de un correo recibido con la plantilla predeterminada, sin la personalización de Oscila.

## Antes de modificar ajustes

- Confirmar que el proyecto corresponde al `VITE_SUPABASE_URL` de Oscila, sin copiar claves en el PR.
- Guardar privadamente la configuración actual de Auth, redirecciones, SMTP y asunto/HTML de confirmación y recuperación.
- Revisar Auth Logs del incidente: endpoint, código, estado, fecha/hora y solicitudes repetidas. Distinguir cuota de correo del proyecto, ventana por destinatario, límite por IP y restricciones SMTP. No adjuntar tokens, enlaces ni correos personales.
- Ejecutar de forma privada la auditoría de solo lectura de `supabase/auditoria-autenticacion.sql`. Revisar cuentas existentes, proveedores, relaciones de propiedad y políticas RLS. Completar con referencias sin FK, funciones y triggers del esquema real.

## SMTP y plantilla

- **Incidencia observada:** el mensaje aportado por el usuario conserva el asunto **Confirm your email address**, remitente **Supabase Auth** y texto predeterminado en inglés. No aparece la plantilla de Oscila. La diferencia de asunto y texto no se explica únicamente por imágenes bloqueadas. La captura no permite identificar por sí sola el proyecto ni comprobar la configuración administrativa.
- Verificar qué proyecto usa el despliegue que generó ese mensaje, comparándolo con sus variables públicas de Supabase. Revisar en ese mismo proyecto **Authentication → Email → Templates → Confirm sign up**: el asunto esperado es **Confirma tu correo y empieza con Oscila** y el cuerpo debe corresponder a `supabase/templates/confirmacion-registro.html`. Conservar antes una copia privada de lo alojado. Confirmar que se guardó en el proyecto/entorno correcto. Integrar el HTML en Git no lo activa en el servicio.
- Comprobar si ya hay SMTP propio activo y si la plantilla alojada coincide con `supabase/templates/confirmacion-registro.html`; no sobrescribir una personalización posterior sin compararla.
- Si hace falta configurar SMTP, acordar proveedor, dominio bajo control del equipo y remitente autorizado. Verificar DNS, capacidad y costes. Guardar credenciales solo en Supabase.
- Mantener **Confirm email** habilitado. Revisar la plantilla de recuperación y desactivar la reescritura de enlaces de Auth en el proveedor.
- Revisar las cuotas efectivas de correo y por IP en Supabase y las cuotas horarias/diarias/mensuales restantes del proveedor, junto con otros consumos de la misma cuenta. Ajustarlas al aforo esperado sin eliminar controles de abuso.

## Google y despliegue

- Configurar cliente OAuth web, audiencia/consentimiento y orígenes permitidos en Google. Usar como callback de Google el que muestra Supabase, no la portada de Oscila.
- Guardar Client ID y secreto en el proveedor Google de Supabase y habilitarlo. No poner el secreto en variables `VITE_`.
- Verificar Site URL de producción y Redirect URLs exactas de desarrollo/producción, incluyendo la ruta base y barra final que usa la aplicación.
- Mantener `VITE_AUTH_GOOGLE=false` hasta comprobar la configuración remota. Luego usar `true` y redesplegar la aplicación con la misma URL y clave publicable del proyecto existente.

## Piloto con destinatarios autorizados

- Pedir al usuario los destinatarios concretos antes de enviar correos de prueba.
- Con una cuenta antigua confirmada, comprobar login, nombre, UUID y acceso a datos antes/después. Con Google del mismo correo, verificar la vinculación y conservación del UUID; revisar especialmente cuentas sin confirmar. No fusionar cuentas distintas manualmente por correo.
- Registrar consecutivamente a personas nuevas dentro de las cuotas acordadas. Confirmar recepción de un solo mensaje por solicitud, asunto, remitente, nombre, enlace y redirección. Comprobar que «Registrar a otra persona» limpia los campos.
- Después de aplicar la plantilla en el proyecto correcto, comprobar un **mensaje nuevo** para un destinatario autorizado: asunto y cuerpo personalizados en español, marca Oscila, saludo y enlace correctos. Un correo antiguo ya recibido no cambia al guardar una plantilla nueva. Verificar el remitente por separado en SMTP; cambiar el HTML no configura su identidad.
- Probar reenvío, login sin confirmar, contraseña errónea, recuperación válida/vencida y contraseña nueva. Revisar mensajes de límites sin provocar abuso para agotarlos.
- Probar sesión temporal y persistente, recarga, cierre, selección/cancelación de Google y navegación sin sesión. Verificar acceso permitido a datos propios y denegado a datos ajenos según RLS real.
- Adjuntar evidencia sin datos personales ni enlaces utilizables. No borrar usuarios, datos o el proyecto previo para probar o revertir.

## Qué cantidad de registros puede confirmarse

No confundir usuarios activos mensuales incluidos en el plan con registros por minuto, hora o día. Para altas por correo, calcular el presupuesto disponible con las **cuotas efectivas**, descontando reenvíos, recuperación y otros envíos, y considerando límites por IP compartida y por destinatario. Un correo disponible no garantiza entrega o confirmación del usuario.

Ejemplo orientativo, no configuración comprobada de Oscila: con 30 correos/hora en Supabase y un proveedor con 100/día y 3.000/mes, habría como máximo teórico 30 altas/hora, 100/día y 3.000/mes si cada alta requiere un único correo y no hay otros consumos. Las demás restricciones pueden reducirlo. Google evita ese presupuesto de correo para su flujo verificado, pero conserva controles del proveedor y Auth.

Dejar en el PR un registro sin secretos:

| Dato | Resultado comprobado por el responsable |
| --- | --- |
| Fecha y proyecto verificado | Por completar |
| Plan de Supabase y usuarios activos incluidos | Por completar |
| SMTP propio y dominio/remitente verificados | Por completar |
| Cuota efectiva de correo en Supabase | Por completar |
| Cuotas restantes del proveedor SMTP | Por completar |
| Límites por IP y ventana por destinatario | Por completar |
| Google activo, audiencia y restricciones | Por completar |
| Aforo e intervalo previstos | Por completar |
| Presupuesto de altas por correo e hipótesis | Por completar |
| Resultado del piloto y conservación de identidad/datos | Por completar |

Los pasos detallados, fuentes oficiales y evidencias locales están en [README.md](README.md). La descripción propuesta del PR está en [PR.md](PR.md).

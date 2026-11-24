## Problema y resultado

El registro de personas consecutivas dependía del correo integrado de Supabase y presentaba cualquier límite de envío como una espera imprecisa. Se conserva Supabase Auth con confirmación, se prepara SMTP propio y se añade Google como acceso opcional tras configurar el proveedor.

Después de solicitar el registro, la pantalla de confirmación permite registrar a otra persona con campos limpios. Se bloquean solicitudes simultáneas, se distinguen errores de correo, acceso, red y límites, y se conserva la persistencia opcional al volver de OAuth. El cierre de sesión retira tokens de ambos almacenes. No cambian UUID, contraseñas, datos ni el motor de circuitos.

## Issue relacionado

Sin issue indicado. Objetivo: permitir altas consecutivas dentro de las cuotas reales y mantener los flujos de cuenta existentes.

## Verificación

- `npm test`: 143 pruebas aprobadas, 8 archivos.
- `npm run build`: correcto; advertencia de bundles mayores de 500 kB.
- Chrome con proveedor local simulado: registro consecutivo y duplicados, confirmación, recuperación, errores, sesión temporal/persistente, recarga, cierre, protección de navegación, Google y cancelación. Google oculto con configuración deshabilitada.
- Consulta pública real de ajustes: registro/email activos, confirmación requerida y Google deshabilitado. Sin envío ni autenticación real.
- Ver resultados de compilación y evidencias en [la documentación](README.md).

## Capturas

[Escritorio](capturas/ingreso-escritorio.png), [registro móvil](capturas/registro-movil.png), [confirmación](capturas/confirmacion-escritorio.png) y [límite de correo](capturas/limite-correo-movil.png). Todas usan configuración simulada, sin cuentas reales.

## Riesgos o pendientes

Requiere configurar y verificar SMTP, DNS/remitente, cuotas, plantilla alojada y Google OAuth; habilitar `VITE_AUTH_GOOGLE` y redesplegar solo después. Falta inventario administrativo de usuarios/datos/RLS y piloto con un destinatario autorizado. No se promete capacidad ilimitada ni entrega gratuita. Se conserva el proyecto y no hay migración.

El usuario detuvo la configuración externa para delegarla al compañero con acceso. Seguir la [lista de revisión de Supabase](REVISION-SUPABASE.md) y registrar allí las cuotas efectivas y la capacidad estimada antes de afirmar una cantidad de registros.

// Consulta pública de solo lectura; no envía correos ni enumera usuarios.
try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if (error.code !== 'ENOENT') throw new Error('No se pudo leer la configuración local.');
}

const url = process.env.VITE_SUPABASE_URL?.trim();
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!url || !key) {
  console.log(JSON.stringify({ configurado: false }));
} else {
  try {
    const respuesta = await fetch(new URL('/auth/v1/settings', url), {
      headers: { apikey: key }, signal: AbortSignal.timeout(15000),
    });
    if (!respuesta.ok) {
      console.log(JSON.stringify({ configurado: true, estadoHttp: respuesta.status }));
    } else {
      const datos = await respuesta.json();
      console.log(JSON.stringify({
        configurado: true, estadoHttp: respuesta.status,
        registroDeshabilitado: datos.disable_signup,
        correoHabilitado: datos.external?.email,
        googleHabilitado: datos.external?.google,
        confirmacionCorreoRequerida: typeof datos.mailer_autoconfirm === 'boolean' ? !datos.mailer_autoconfirm : null,
        smtpPlantillaCuotasUsuarios: 'No observables con la clave pública; requieren acceso administrativo.',
      }, null, 2));
    }
  } catch {
    console.log(JSON.stringify({ configurado: true, consulta: 'No se pudo consultar el servicio; configuración remota no verificada.' }));
    process.exitCode = 1;
  }
}

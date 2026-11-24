import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { createServer as crearHttp } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer as crearVite } from 'vite';

// Solo usa un proveedor simulado en loopback y un perfil temporal de Chrome.
const destino = path.resolve('docs/autenticacion/capturas');
await mkdir(destino, { recursive: true });
const usuario = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated',
  email: 'ana@example.invalid', email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: { provider: 'email', providers: ['email', 'google'] }, user_metadata: { full_name: 'Ana de prueba' } };
const jwt = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: usuario.id, exp: Math.floor(Date.now() / 1000) + 3600, role: 'authenticated' })).toString('base64url')}.firma-ficticia`;
const sesion = { access_token: jwt, refresh_token: 'refresh-ficticio', token_type: 'bearer', expires_in: 3600, user: usuario };
const peticiones = [];
let fallo = null;
let urlApp;
const proveedor = crearHttp(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'X-Supabase-Api-Version');
  res.setHeader('X-Supabase-Api-Version', '2024-01-01');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.end();
  const url = new URL(req.url, 'http://localhost');
  peticiones.push({ metodo: req.method, ruta: url.pathname, consulta: Object.fromEntries(url.searchParams) });
  for await (const _ of req) { /* descartar el cuerpo sin registrarlo */ }
  if (url.pathname.endsWith('/authorize')) {
    if (fallo) {
      res.writeHead(302, { Location: `${urlApp}#error=access_denied&error_description=detalle-privado` });
    } else {
      const fragmento = new URLSearchParams({ access_token: jwt, refresh_token: 'refresh-ficticio', expires_in: '3600', token_type: 'bearer', type: 'signup' });
      res.writeHead(302, { Location: `${urlApp}#${fragmento}` });
    }
    return res.end();
  }
  if (fallo) {
    res.statusCode = fallo.status || 429;
    return res.end(JSON.stringify({ code: fallo.code, msg: 'Detalle privado del proveedor simulado' }));
  }
  if (url.pathname.endsWith('/signup')) {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return res.end(JSON.stringify(usuario));
  }
  if (url.pathname.endsWith('/token')) return res.end(JSON.stringify(sesion));
  if (url.pathname.endsWith('/user')) return res.end(JSON.stringify(usuario));
  res.end('{}');
});
await new Promise((resolve) => proveedor.listen(0, '127.0.0.1', resolve));
const urlProveedor = `http://127.0.0.1:${proveedor.address().port}`;
const vite = await crearVite({
  envFile: false,
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(urlProveedor),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('sb_publishable_prueba_local'),
    'import.meta.env.VITE_AUTH_GOOGLE': JSON.stringify(process.env.OSCILA_QA_SIN_GOOGLE ? 'false' : 'true'),
  },
  server: { host: '127.0.0.1', port: 0, open: false },
});
await vite.listen();
urlApp = vite.resolvedUrls.local[0];
const perfil = await mkdtemp(path.join(tmpdir(), 'oscila-auth-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost',
  '--remote-debugging-port=0', `--user-data-dir=${perfil}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
const resultados = [];
try {
  const direccion = await new Promise((resolve, reject) => {
    const limite = setTimeout(() => reject(new Error('Chrome no inició')), 30000);
    let salida = '';
    chrome.on('error', reject);
    chrome.stderr.on('data', (datos) => {
      salida += datos;
      const coincidencia = salida.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (coincidencia) { clearTimeout(limite); resolve(coincidencia[1]); }
    });
  });
  socket = new WebSocket(direccion);
  await once(socket, 'open');
  let siguiente = 0;
  const pendientes = new Map();
  socket.addEventListener('message', ({ data }) => {
    const mensaje = JSON.parse(data);
    if (!mensaje.id) return;
    const pendiente = pendientes.get(mensaje.id);
    pendientes.delete(mensaje.id);
    if (mensaje.error) pendiente.reject(new Error(JSON.stringify(mensaje.error)));
    else pendiente.resolve(mensaje.result);
  });
  const llamar = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++siguiente;
    pendientes.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const { targetId } = await llamar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await llamar('Target.attachToTarget', { targetId, flatten: true });
  const evaluar = async (expression) => {
    const respuesta = await llamar('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (respuesta.exceptionDetails) throw new Error(respuesta.exceptionDetails.text + ': ' + respuesta.exceptionDetails.exception?.description);
    return respuesta.result.value;
  };
  const esperar = async (expression) => {
    for (let i = 0; i < 150; i++) {
      if (await evaluar(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`No se cumplió: ${expression}`);
  };
  const click = async (texto) => {
    await evaluar(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(texto)}); if (!b) throw Error('Botón ausente'); b.click(); })()`);
  };
  const rellenar = (campos) => evaluar(`(() => {
    const valores = ${JSON.stringify(campos)};
    for (const [nombre, valor] of Object.entries(valores)) {
      const input = document.querySelector('[name="' + nombre + '"]');
      if (input.type === 'checkbox') { if (input.checked !== valor) input.click(); }
      else { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, valor); input.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  })()`);
  const navegar = async (fragmento = '') => {
    await llamar('Page.navigate', { url: 'about:blank' }, sessionId);
    await llamar('Page.navigate', { url: urlApp + fragmento }, sessionId);
    await esperar(`document.querySelector('.acceso-enviar:not(:disabled), .plataforma-cuenta') !== null`);
  };
  const enviar = async (doble = false) => {
    await evaluar(`document.querySelector('.acceso-form').requestSubmit(); ${doble ? "document.querySelector('.acceso-form').requestSubmit();" : ''}`);
    await esperar(`document.querySelector('.acceso-form[aria-busy="false"], .plataforma-cuenta') !== null`);
  };
  const captura = async (nombre, width, height) => {
    await llamar('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
    await evaluar('document.fonts.ready');
    const medidas = await evaluar('({ancho: innerWidth, contenido: document.documentElement.scrollWidth})');
    assert.equal(medidas.ancho, width);
    assert.ok(medidas.contenido <= width, `Desbordamiento: ${nombre}`);
    const png = await llamar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
    await writeFile(path.join(destino, `${nombre}.png`), Buffer.from(png.data, 'base64'));
    resultados.push({ caso: nombre, ...medidas });
  };
  const almacenes = () => evaluar(`({local: Object.keys(localStorage).filter(k => k.endsWith('-auth-token')).length, temporal: Object.keys(sessionStorage).filter(k => k.endsWith('-auth-token')).length})`);
  await llamar('Page.enable', {}, sessionId);
  await navegar();
  if (process.env.OSCILA_QA_SIN_GOOGLE) {
    assert.equal(await evaluar(`document.querySelector('.acceso-google') === null`), true);
    await captura('sin-google', 1366, 900);
  } else {
    await captura('ingreso-escritorio', 1366, 1000);
    await captura('ingreso-movil', 390, 844);
    await click('Registrarse');
    await captura('registro-movil', 390, 844);
    await captura('registro-320', 320, 900);
    await captura('registro-escritorio', 1366, 1000);
    await rellenar({ nombre: 'Ana de prueba', email: 'ana@example.invalid', password: 'Prueba-local-123', terminos: true });
    const antes = peticiones.filter(p => p.ruta.endsWith('/signup')).length;
    await enviar(true);
    assert.equal(peticiones.filter(p => p.ruta.endsWith('/signup')).length - antes, 1);
    await esperar(`document.body.textContent.includes('Registrar a otra persona')`);
    assert.equal(await evaluar(`document.querySelector('[name="password"]') === null`), true);
    await captura('confirmacion-escritorio', 1366, 900);
    await click('Solicitar otra confirmación');
    await esperar(`document.querySelector('.acceso-form[aria-busy="false"]') !== null`);
    assert.ok(peticiones.some(p => p.ruta.endsWith('/resend')));
    await click('Registrar a otra persona');
    assert.deepEqual(await evaluar(`[...document.querySelectorAll('.acceso-form input:not([type="checkbox"])')].map(i => i.value)`), ['', '', '']);
    await rellenar({ nombre: 'Luis de prueba', email: 'luis@example.invalid', password: 'Prueba-local-456', terminos: true });
    await enviar();
    assert.equal(peticiones.filter(p => p.ruta.endsWith('/signup')).length - antes, 2);
    await click('Registrar a otra persona');
    await rellenar({ nombre: 'Otra persona', email: 'otra@example.invalid', password: 'Prueba-local-789', terminos: true });
    fallo = { code: 'over_email_send_rate_limit' };
    await enviar();
    await esperar(`document.querySelector('[role="alert"]').textContent.includes('envío de correos')`);
    await captura('limite-correo-movil', 390, 844);
    fallo = { code: 'email_address_not_authorized', status: 403 };
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /configuración del envío/);
    await click('Iniciar sesión');
    await rellenar({ email: 'ana@example.invalid', password: 'Prueba-local-123' });
    fallo = { code: 'invalid_credentials', status: 400 };
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /correo y la contraseña/);
    fallo = { code: 'email_not_confirmed', status: 400 };
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /Confirma tu correo/);
    fallo = { code: 'over_request_rate_limit' };
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /esta red/);
    fallo = null;
    await click('¿Olvidaste tu contraseña?');
    await rellenar({ email: 'ana@example.invalid' });
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="status"]').textContent`), /Si el correo está registrado/);
    await captura('recuperacion-movil', 390, 844);
    assert.ok(peticiones.some(p => p.ruta.endsWith('/recover')));
    await click('Volver a iniciar sesión');
    for (const recordar of [false, true]) {
      await rellenar({ email: 'ana@example.invalid', password: 'Prueba-local-123', recordar });
      await enviar();
      await esperar(`document.querySelector('.plataforma-cuenta') !== null`);
      assert.match(await evaluar(`document.querySelector('.plataforma-cuenta').textContent`), /Ana de prueba/);
      assert.deepEqual(await almacenes(), { local: recordar ? 1 : 0, temporal: recordar ? 0 : 1 });
      await navegar();
      assert.equal(await evaluar(`document.querySelector('.plataforma-cuenta') !== null`), true);
      await click('Cerrar sesión');
      await esperar(`document.querySelector('.acceso-form') !== null`);
      assert.deepEqual(await almacenes(), { local: 0, temporal: 0 });
      await navegar();
      assert.equal(await evaluar(`document.querySelector('.plataforma-cuenta') === null`), true);
    }
    for (const recordar of [false, true]) {
      await rellenar({ recordar });
      await click('Continuar con Google');
      await esperar(`document.querySelector('.plataforma-cuenta') !== null`);
      assert.deepEqual(await almacenes(), { local: recordar ? 1 : 0, temporal: recordar ? 0 : 1 });
      const autorizacion = peticiones.findLast(p => p.ruta.endsWith('/authorize'));
      assert.equal(autorizacion.consulta.provider, 'google');
      assert.equal(autorizacion.consulta.prompt, 'select_account');
      await click('Cerrar sesión');
      await esperar(`document.querySelector('.acceso-form') !== null`);
    }
    fallo = { code: 'access_denied' };
    await click('Continuar con Google');
    await esperar(`document.querySelector('[role="alert"]')?.textContent.includes('No se completó el acceso con Google')`);
    assert.equal(await evaluar(`location.href.includes('detalle-privado')`), false);
    fallo = null;
    await navegar('#error_code=otp_expired&error_description=privado');
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /enlace ya no es válido/);
    const recuperacion = new URLSearchParams({ access_token: jwt, refresh_token: 'refresh-ficticio', expires_in: '3600', token_type: 'bearer', type: 'recovery' });
    await navegar(`#${recuperacion}`);
    await esperar(`document.body.textContent.includes('Crea una nueva contraseña')`);
    await rellenar({ password: 'Clave-nueva-simulada' });
    fallo = { code: 'session_not_found', status: 400 };
    await enviar();
    assert.match(await evaluar(`document.querySelector('[role="alert"]').textContent`), /recuperación ya no es válida/);
    fallo = null;
    await navegar(`#${recuperacion}`);
    await esperar(`document.body.textContent.includes('Crea una nueva contraseña')`);
    await rellenar({ password: 'Clave-nueva-simulada' });
    await enviar();
    await esperar(`document.querySelector('.plataforma-cuenta') !== null`);
    await click('Cerrar sesión');
    await esperar(`document.querySelector('.acceso-form') !== null`);
    resultados.push({ caso: 'flujos-simulados', registroConsecutivo: true, duplicadosBloqueados: true,
      recuperacion: true, sesionTemporalYPersistente: true, googleYCancelacion: true,
      rutasProtegidas: true, cierreSesion: true, llamadasAuthSimuladas: peticiones.length });
  }
  await writeFile(path.resolve(`docs/autenticacion/validacion${process.env.OSCILA_QA_SIN_GOOGLE ? '-sin-google' : ''}.json`), JSON.stringify(resultados, null, 2) + '\n');
  console.log(JSON.stringify(resultados, null, 2));
  await llamar('Browser.close');
} finally {
  socket?.close();
  chrome.kill();
  await vite.close();
  proveedor.closeAllConnections();
  await new Promise((resolve) => proveedor.close(resolve));
}

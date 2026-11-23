import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { once } from 'node:events';

const raiz = fileURLToPath(new URL('../../', import.meta.url));
const destino = path.join(raiz, 'docs/correo-confirmacion/capturas');
const navegador = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const perfil = await mkdtemp(path.join(tmpdir(), 'oscila-correo-'));
await mkdir(destino, { recursive: true });
const proceso = spawn(navegador, [
  '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${perfil}`, 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });

let socket;
try {
  const direccion = await new Promise((resolve, reject) => {
    const limite = setTimeout(() => reject(new Error('Chrome no inició en 30 segundos')), 30000);
    let salida = '';
    proceso.on('error', reject);
    proceso.stderr.on('data', (datos) => {
      salida += datos;
      const coincidencia = salida.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (coincidencia) { clearTimeout(limite); resolve(coincidencia[1]); }
    });
  });
  socket = new WebSocket(direccion);
  await once(socket, 'open');
  let siguiente = 0;
  const pendientes = new Map();
  const eventos = new Map();
  socket.addEventListener('message', ({ data }) => {
    const mensaje = JSON.parse(data);
    if (mensaje.id) {
      const pendiente = pendientes.get(mensaje.id);
      pendientes.delete(mensaje.id);
      if (mensaje.error) pendiente.reject(new Error(JSON.stringify(mensaje.error)));
      else pendiente.resolve(mensaje.result);
    } else {
      const clave = `${mensaje.sessionId}:${mensaje.method}`;
      eventos.get(clave)?.();
      eventos.delete(clave);
    }
  });
  const llamar = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++siguiente;
    pendientes.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const esperar = (metodo, sesion) => new Promise((resolve, reject) => {
    const limite = setTimeout(() => reject(new Error(`Tiempo agotado: ${metodo}`)), 30000);
    eventos.set(`${sesion}:${metodo}`, () => { clearTimeout(limite); resolve(); });
  });
  const casos = [
    ['escritorio', 'con-nombre', 960, 1000, false],
    ['sin-nombre', 'sin-nombre', 960, 1000, false],
    ['movil', 'con-nombre', 390, 1200, false],
    ['movil-320', 'con-nombre', 320, 1400, false],
    ['imagenes-bloqueadas', 'con-nombre', 390, 1200, true],
    ['nombre-no-confiable', 'nombre-no-confiable', 390, 1200, false],
  ];
  const resultados = [];
  for (const [nombre, vista, width, height, bloquear] of casos) {
    const { targetId } = await llamar('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await llamar('Target.attachToTarget', { targetId, flatten: true });
    await llamar('Page.enable', {}, sessionId);
    await llamar('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 }, sessionId);
    if (bloquear) {
      await llamar('Network.enable', {}, sessionId);
      await llamar('Network.setBlockedURLs', { urls: ['*LOGOTIPO-NOMBRE.png'] }, sessionId);
    }
    const cargada = esperar('Page.loadEventFired', sessionId);
    await llamar('Page.navigate', { url: pathToFileURL(path.join(raiz, `docs/correo-confirmacion/vistas/${vista}.html`)).href }, sessionId);
    await cargada;
    const { result } = await llamar('Runtime.evaluate', {
      returnByValue: true,
      expression: `({ ancho: innerWidth, contenido: document.documentElement.scrollWidth,
        imagenes: document.images.length, logo: document.images[0].naturalWidth,
        saludo: [...document.querySelectorAll('p')].find(p => p.textContent.startsWith('Hola'))?.textContent,
        enlaces: [...document.querySelectorAll('a')].map(a => a.href) })`,
    }, sessionId);
    const comprobacion = result.value;
    assert.equal(comprobacion.ancho, width, 'El viewport debe coincidir con el ancho solicitado');
    assert.ok(comprobacion.contenido <= width, 'No debe haber desbordamiento horizontal');
    assert.equal(comprobacion.imagenes, 1, 'El nombre no debe insertar imágenes');
    assert.equal(comprobacion.logo > 0, !bloquear, 'La carga del logo debe coincidir con el caso');
    assert.equal(comprobacion.enlaces.length, 2);
    assert.equal(comprobacion.enlaces[0], comprobacion.enlaces[1]);
    const captura = await llamar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
    await writeFile(path.join(destino, `${nombre}.png`), Buffer.from(captura.data, 'base64'));
    resultados.push({ caso: nombre, ...comprobacion });
    console.log(`${nombre}: ${comprobacion.ancho}px, contenido ${comprobacion.contenido}px, logo ${comprobacion.logo}px`);
    await llamar('Target.closeTarget', { targetId });
  }
  await writeFile(path.join(destino, '../validacion.json'), JSON.stringify(resultados, null, 2) + '\n');
  await llamar('Browser.close');
} finally {
  socket?.close();
  proceso.kill();
}

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { reconocer, MODELO_POR_DEFECTO } from './_nucleo.js';

const valido = JSON.parse(readFileSync(resolve(process.cwd(), 'src/contenido/fotos/ej14.json'), 'utf8'));
const entrada = { imagen: 'aGVsbG8=', mime: 'image/jpeg' };
const entorno = { GEMINI_API_KEY: 'clave-de-prueba' };

function respuestaGemini(objeto, status = 200) {
  const cuerpo = status === 200 ? { candidates: [{ content: { parts: [{ text: typeof objeto === 'string' ? objeto : JSON.stringify(objeto) }] } }] } : { error: { message: objeto } };
  return { status, text: async () => JSON.stringify(cuerpo) };
}

afterEach(() => vi.unstubAllGlobals());

describe('api/_nucleo reconocer', () => {
  it('sin API key responde 503 y no llama a Gemini', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    const r = await reconocer(entrada, {});
    expect(r.status).toBe(503);
    expect(r.cuerpo.codigo).toBe('sin-clave');
    expect(f).not.toHaveBeenCalled();
  });

  it('respuesta válida: 200 con la netlist validada; la clave va en cabecera y no en la URL', async () => {
    const f = vi.fn(async () => respuestaGemini(valido));
    vi.stubGlobal('fetch', f);
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(200);
    expect(r.cuerpo.reconocimiento.elementos).toHaveLength(7);
    expect(r.cuerpo.modelo).toBe(MODELO_POR_DEFECTO);
    const [url, opciones] = f.mock.calls[0];
    expect(url).toContain(`models/${MODELO_POR_DEFECTO}:generateContent`);
    expect(url).not.toContain('clave-de-prueba');
    expect(opciones.headers['x-goog-api-key']).toBe('clave-de-prueba');
    const body = JSON.parse(opciones.body);
    expect(body.generation_config.response_mime_type).toBe('application/json');
    expect(body.generation_config.response_schema).toBeDefined();
  });

  it('usa GEMINI_MODEL si está definido', async () => {
    const f = vi.fn(async () => respuestaGemini(valido));
    vi.stubGlobal('fetch', f);
    await reconocer(entrada, { ...entorno, GEMINI_MODEL: 'gemini-3.6-flash' });
    expect(f.mock.calls[0][0]).toContain('models/gemini-3.6-flash:generateContent');
  });

  it('429 → código "cuota"', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respuestaGemini('quota', 429)));
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(429);
    expect(r.cuerpo.codigo).toBe('cuota');
  });

  it('JSON que no cumple el esquema → 422 con detalles', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respuestaGemini({ elementos: [], nodos: [] })));
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(422);
    expect(r.cuerpo.codigo).toBe('esquema');
  });

  it('texto que no es JSON → 422', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respuestaGemini('no es json')));
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(422);
    expect(r.cuerpo.codigo).toBe('json');
  });

  it('si la API rechaza el esquema, reintenta sin él', async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce({ status: 400, text: async () => JSON.stringify({ error: { message: 'Invalid response_schema' } }) })
      .mockResolvedValueOnce(respuestaGemini(valido));
    vi.stubGlobal('fetch', f);
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(200);
    expect(JSON.parse(f.mock.calls[1][1].body).generation_config.response_schema).toBeUndefined();
  });

  it('key inválida (Gemini responde 400 API_KEY_INVALID) → código "clave"', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ status: 400, text: async () => JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key.', details: [{ reason: 'API_KEY_INVALID' }] } }) })));
    const r = await reconocer(entrada, entorno);
    expect(r.status).toBe(502);
    expect(r.cuerpo.codigo).toBe('clave');
  });

  it('rechaza formatos de imagen no soportados', async () => {
    const r = await reconocer({ imagen: 'x', mime: 'image/gif' }, entorno);
    expect(r.status).toBe(400);
  });
});

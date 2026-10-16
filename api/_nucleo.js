// Núcleo del reconocimiento de fotos con Gemini. Lo usan la función de Vercel (api/reconocer.js)
// y el servidor de desarrollo de Vite (vite.config.js). La API key solo existe en el servidor.

import { PROMPT, esquemaGemini, esquemaReconocimiento } from '../src/circuitos/reconocimiento.js';

export const MODELO_POR_DEFECTO = 'gemini-3.5-flash-lite';
const TAM_MAX = 6 * 1024 * 1024; // ~6 MB en base64

const respuesta = (status, cuerpo) => ({ status, cuerpo });

async function llamarGemini({ clave, modelo, imagen, mime, conEsquema }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`;
  const generation_config = { response_mime_type: 'application/json', temperature: 0.1 };
  if (conEsquema) generation_config.response_schema = esquemaGemini;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: imagen } }] }],
      generation_config,
    }),
  });
  const texto = await r.text();
  let json = null;
  try {
    json = JSON.parse(texto);
  } catch {
    /* respuesta no JSON */
  }
  return { status: r.status, json, texto };
}

/**
 * entrada: { imagen: base64 sin prefijo, mime }  ·  entorno: { GEMINI_API_KEY, GEMINI_MODEL }
 * Devuelve { status, cuerpo } con cuerpo = { reconocimiento, modelo } o { error, codigo }.
 */
export async function reconocer(entrada, entorno) {
  const clave = entorno.GEMINI_API_KEY;
  if (!clave) return respuesta(503, { codigo: 'sin-clave', error: 'El servidor no tiene configurada la API key de Gemini (GEMINI_API_KEY).' });
  const { imagen, mime } = entrada ?? {};
  if (typeof imagen !== 'string' || !imagen.length) return respuesta(400, { codigo: 'sin-imagen', error: 'No llegó ninguna imagen.' });
  if (imagen.length > TAM_MAX) return respuesta(413, { codigo: 'muy-grande', error: 'La imagen es demasiado grande.' });
  if (!/^image\/(jpeg|png|webp)$/.test(mime ?? '')) return respuesta(400, { codigo: 'formato', error: 'Formato de imagen no soportado (usa JPG, PNG o WebP).' });

  const modelo = entorno.GEMINI_MODEL || MODELO_POR_DEFECTO;
  let r;
  try {
    r = await llamarGemini({ clave, modelo, imagen, mime, conEsquema: true });
    // Si la API no acepta el esquema, se reintenta sin él (el JSON se valida igual con zod)
    if (r.status === 400 && /schema/i.test(r.texto)) r = await llamarGemini({ clave, modelo, imagen, mime, conEsquema: false });
  } catch {
    return respuesta(502, { codigo: 'red', error: 'No se pudo contactar el servicio de reconocimiento.' });
  }

  if (r.status === 429) return respuesta(429, { codigo: 'cuota', error: 'Se agotó la cuota gratuita de reconocimiento por ahora.' });
  const claveInvalida = r.status === 400 && /API_KEY_INVALID|API key not valid/i.test(r.texto);
  if (r.status === 401 || r.status === 403 || claveInvalida) return respuesta(502, { codigo: 'clave', error: 'La API key de Gemini no es válida o no tiene permiso para este modelo.' });
  if (r.status === 404) return respuesta(502, { codigo: 'modelo', error: `El modelo "${modelo}" no existe o no está disponible. Revisa GEMINI_MODEL.` });
  if (r.status !== 200 || !r.json) return respuesta(502, { codigo: 'servicio', error: `El servicio de reconocimiento respondió con un error (${r.status}).` });

  const texto = r.json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  let datos;
  try {
    datos = JSON.parse(texto.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    return respuesta(422, { codigo: 'json', error: 'El modelo no devolvió un JSON válido. Intenta con una foto más clara.' });
  }
  const v = esquemaReconocimiento.safeParse(datos);
  if (!v.success) {
    return respuesta(422, {
      codigo: 'esquema',
      error: 'El resultado del reconocimiento no cumple el formato esperado.',
      detalles: v.error.issues.slice(0, 8).map((i) => `${i.path.join('.')}: ${i.message}`),
    });
  }
  return respuesta(200, { reconocimiento: v.data, modelo });
}

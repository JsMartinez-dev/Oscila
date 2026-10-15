// Función serverless de Vercel: POST /api/reconocer  { imagen (base64), mime }
// La API key se configura en Vercel como variable de entorno GEMINI_API_KEY (y opcionalmente GEMINI_MODEL).

import { reconocer } from './_nucleo.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ codigo: 'metodo', error: 'Usa POST.' });
  }
  let cuerpo = req.body;
  if (typeof cuerpo === 'string') {
    try {
      cuerpo = JSON.parse(cuerpo);
    } catch {
      return res.status(400).json({ codigo: 'json', error: 'Cuerpo inválido.' });
    }
  }
  const { status, cuerpo: salida } = await reconocer(cuerpo, process.env);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(salida);
}

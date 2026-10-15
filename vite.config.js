import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// /api/reconocer usa el mismo código que la función de Vercel, tanto con `npm run dev` como con
// `npm run preview`, con la API key leída de .env.local (nunca llega al navegador: no lleva prefijo VITE_).
function apiLocal(env) {
  const nucleo = pathToFileURL(resolve(process.cwd(), 'api/_nucleo.js')).href

  const middleware = async (req, res) => {
    const enviar = (status, cuerpo) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify(cuerpo))
    }
    if (req.method !== 'POST') return enviar(405, { codigo: 'metodo', error: 'Usa POST.' })
    let datos = ''
    for await (const trozo of req) datos += trozo
    let cuerpo
    try {
      cuerpo = JSON.parse(datos)
    } catch {
      return enviar(400, { codigo: 'json', error: 'Cuerpo inválido.' })
    }
    try {
      const { reconocer } = await import(nucleo)
      const r = await reconocer(cuerpo, { GEMINI_API_KEY: env.GEMINI_API_KEY, GEMINI_MODEL: env.GEMINI_MODEL })
      enviar(r.status, r.cuerpo)
    } catch {
      enviar(500, { codigo: 'servidor', error: 'Error interno del servidor de reconocimiento.' })
    }
  }

  return {
    name: 'api-reconocer-local',
    configureServer(server) {
      server.middlewares.use('/api/reconocer', middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/reconocer', middleware)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiLocal(env)],
    server: {
      port: 5173,
      open: true
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js', 'api/**/*.test.js']
    }
  }
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, /api/reconocer usa el mismo código que la función de Vercel,
// con la API key leída de .env.local (nunca llega al navegador: no lleva prefijo VITE_).
function apiLocal(env) {
  return {
    name: 'api-reconocer-local',
    configureServer(server) {
      server.middlewares.use('/api/reconocer', async (req, res) => {
        const enviar = (status, cuerpo) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
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
        const { reconocer } = await server.ssrLoadModule('/api/_nucleo.js')
        const r = await reconocer(cuerpo, { GEMINI_API_KEY: env.GEMINI_API_KEY, GEMINI_MODEL: env.GEMINI_MODEL })
        enviar(r.status, r.cuerpo)
      })
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

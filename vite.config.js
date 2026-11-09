import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Las peticiones a /api las atiende el servidor Express (server/index.js).
  // Al pasar por el proxy de Vite son del mismo origen: no hace falta configurar CORS.
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})

// Registro de peticiones para el panel «Red». Infraestructura de la demo.
// Envuelve window.fetch para anotar las llamadas a /api (menos las de /api/admin, que son
// los controles de la demo). Así el código que se enseña (src/api) usa fetch normal.
import { reactive } from 'vue'

export const networkLog = reactive([])

export function anotar(metodo, url, estado = '') {
  networkLog.unshift({ id: crypto.randomUUID(), hora: new Date(), metodo, url, estado })
  if (networkLog.length > 40) networkLog.pop()
  return networkLog[0] // a través del proxy reactivo, para que el panel se actualice
}

export function instalarRegistroDeRed() {
  const fetchOriginal = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url
    if (!url.startsWith('/api/') || url.startsWith('/api/admin')) return fetchOriginal(input, init)

    const entrada = anotar(init?.method ?? 'GET', url.replace(/^\/api/, ''), '…')
    try {
      const res = await fetchOriginal(input, init)
      entrada.estado = res.status
      return res
    } catch (e) {
      entrada.estado = 'error'
      throw e
    }
  }
}

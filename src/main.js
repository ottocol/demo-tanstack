import { createApp } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import { instalarRegistroDeRed } from './demo-ui/networkLog'

// Solo para la demo: anota las peticiones a /api en el panel «Red»
instalarRegistroDeRed()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime y gcTime se dejan con sus valores por defecto (0 y 5 min);
      // cada paso pone los suyos explícitamente para que se vean en el código.

      // Desactivado para la clase: cada vez que se vuelve de las transparencias al navegador
      // se haría un refetch que nadie ha pedido. (Ver "Ampliaciones" en el README.)
      refetchOnWindowFocus: false,
      // Sin reintentos, para que los errores se vean al momento
      retry: false,
    },
  },
})

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin, { queryClient, enableDevtoolsV6Plugin: true })
app.mount('#app')

import { createRouter, createWebHistory } from 'vue-router'
import Paso1 from '@/pasos/paso1/Paso1.vue'
import Paso2 from '@/pasos/paso2/Paso2.vue'
import Paso3 from '@/pasos/paso3/Paso3.vue'
import Paso4 from '@/pasos/paso4/Paso4.vue'
import Paso5 from '@/pasos/paso5/Paso5.vue'

export const pasos = [
  { path: '/1-sin-tanstack', titulo: '1 · Sin TanStack', component: Paso1 },
  { path: '/2-use-query', titulo: '2 · useQuery', component: Paso2 },
  { path: '/3-stale-gc', titulo: '3 · staleTime / gcTime', component: Paso3 },
  { path: '/4-paginacion', titulo: '4 · Paginación', component: Paso4 },
  { path: '/5-mutaciones', titulo: '5 · Mutaciones', component: Paso5 },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', redirect: pasos[0].path }, ...pasos],
})

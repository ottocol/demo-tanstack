import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { qk } from './keys'
import { getPosts, getPostsPage, likePost } from '@/api/posts'

// ---- Lectura ---------------------------------------------------------------------------

// Lista completa de posts. Las opciones (staleTime, gcTime…) las pasa cada paso
// para que se vea en el propio componente qué configuración se está usando.
export function usePosts(options = {}) {
  return useQuery({
    queryKey: qk.posts(),
    queryFn: getPosts,
    ...options,
  })
}

// Una página de posts. `page` es un ref: al cambiar, cambia la clave y TanStack
// busca esa clave en caché (o la pide al servidor si no está).
export const POSTS_POR_PAGINA = 4

export function usePostsPage(page, options = {}) {
  return useQuery({
    queryKey: qk.postsPage(page),
    queryFn: () => getPostsPage(page.value, POSTS_POR_PAGINA),
    ...options,
  })
}

// ---- Escritura: dar like ---------------------------------------------------------------

// Versión 1: esperar al servidor y después invalidar.
// La caché se marca como "stale" y las queries montadas se vuelven a pedir.
export function useLikeInvalidando() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => likePost(id),
    // Devolvemos la promesa: así la mutación sigue "pending" hasta que llegan los datos
    // nuevos, y el botón no se reactiva mostrando todavía el número viejo.
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.posts() }),
  })
}

// Versión 2: actualización optimista.
// Cambiamos la caché ANTES de que responda el servidor; si falla, la dejamos como estaba.
export function useLikeOptimista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => likePost(id),

    onMutate: async (id) => {
      // 1. Cancelar refetch en curso para que no machaquen nuestro cambio
      await qc.cancelQueries({ queryKey: qk.posts() })
      // 2. Guardar lo que había, por si hay que deshacer
      const anterior = qc.getQueryData(qk.posts())
      // 3. Escribir en la caché el resultado que esperamos
      qc.setQueryData(qk.posts(), (posts) =>
        posts?.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
      )
      // Lo que devolvemos aquí llega como `contexto` a onError/onSettled
      return { anterior }
    },

    onError: (_error, _id, contexto) => {
      // 4. Si el servidor falla, restaurar
      qc.setQueryData(qk.posts(), contexto.anterior)
    },

    // 5. Tanto si va bien como si no, sincronizar con lo que diga el servidor
    onSettled: () => qc.invalidateQueries({ queryKey: qk.posts() }),
  })
}

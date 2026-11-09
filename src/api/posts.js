// Llamadas al API REST (servidor Express en /server). Son las queryFn / mutationFn
// que usa TanStack Query: devuelven una promesa con los datos o lanzan un error.

// OJO: fetch solo rechaza la promesa si falla la red. Si el servidor responde 404 o 500,
// la promesa se resuelve igual. Hay que comprobar res.ok y lanzar nosotros el error;
// si no, TanStack Query daría la petición por buena.
async function pedir(url, opciones) {
  const res = await fetch(url, opciones)
  if (!res.ok) throw new Error(`${opciones?.method ?? 'GET'} ${url} → ${res.status}`)
  return res.json()
}

export function getPosts() {
  return pedir('/api/posts')
}

export function getPostsPage(page, perPage) {
  return pedir(`/api/posts?page=${page}&perPage=${perPage}`)
}

export function likePost(id) {
  return pedir(`/api/posts/${id}/like`, { method: 'POST' })
}

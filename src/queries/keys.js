// Claves de las queries en un solo sitio.
// Todas empiezan por 'posts', así invalidateQueries({ queryKey: ['posts'] }) las afecta a todas.
export const qk = {
  posts: () => ['posts'],                        // la lista completa
  postsPage: (page) => ['posts', 'page', page],  // una página: el parámetro VA EN LA CLAVE
}

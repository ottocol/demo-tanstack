// API REST de la demo (Express). Los datos se guardan en memoria: sobreviven a recargar
// la página, y se pierden al reiniciar el servidor (o con «Restaurar datos iniciales»).
//
//   GET  /api/posts                    → todos los posts
//   GET  /api/posts?page=2&perPage=4   → una página: { page, totalPages, items }
//   POST /api/posts/:id/like           → suma un like y devuelve el post actualizado
//
// Rutas /api/admin/* : controles del panel «Servidor» de la demo (no forman parte del API).
import express from 'express'
import { POSTS_INICIALES } from './postsIniciales.js'

const PUERTO = 3001

const CONFIG_INICIAL = {
  latenciaMs: 800,     // retardo artificial para que se vean los estados de carga
  likesFallan: false,  // si es true, POST /like responde 500
}

let posts = structuredClone(POSTS_INICIALES)
const config = { ...CONFIG_INICIAL }

const app = express()
app.use(express.json())

// Retardo artificial en todas las rutas del API (salvo las de administración)
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/admin')) return next()
  setTimeout(next, config.latenciaMs)
})

// ---- API ----------------------------------------------------------------------------

app.get('/api/posts', (req, res) => {
  const page = Number(req.query.page)
  if (!page) return res.json(posts)

  const perPage = Number(req.query.perPage) || 4
  const inicio = (page - 1) * perPage
  res.json({
    page,
    totalPages: Math.ceil(posts.length / perPage),
    items: posts.slice(inicio, inicio + perPage),
  })
})

app.post('/api/posts/:id/like', (req, res) => {
  if (config.likesFallan) return res.status(500).json({ error: 'Error simulado del servidor' })

  const post = posts.find((p) => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'Post no encontrado' })
  post.likes++
  res.json(post)
})

// ---- Administración de la demo --------------------------------------------------------

app.get('/api/admin/config', (req, res) => res.json(config))

app.put('/api/admin/config', (req, res) => {
  const { latenciaMs, likesFallan } = req.body
  if (Number.isFinite(latenciaMs)) config.latenciaMs = Math.max(0, latenciaMs)
  if (typeof likesFallan === 'boolean') config.likesFallan = likesFallan
  res.json(config)
})

// Simula que otro usuario da likes: cambia los datos sin que el cliente se entere
app.post('/api/admin/otro-usuario', (req, res) => {
  const post = posts[Math.floor(Math.random() * posts.length)]
  post.likes += 5
  res.json(post)
})

// Vuelve a los datos y la configuración de partida
app.post('/api/admin/restaurar', (req, res) => {
  posts = structuredClone(POSTS_INICIALES)
  Object.assign(config, CONFIG_INICIAL)
  res.json(config)
})

app.listen(PUERTO, () => console.log(`API de la demo en http://localhost:${PUERTO}/api/posts`))

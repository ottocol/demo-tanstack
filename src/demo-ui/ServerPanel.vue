<script setup>
// Controles del servidor Express (rutas /api/admin). Infraestructura de la demo.
import { ref, onMounted } from 'vue'
import { anotar } from './networkLog'

const config = ref(null)
const sinConexion = ref(false)

async function admin(metodo, ruta, body) {
  try {
    const res = await fetch(`/api/admin/${ruta}`, {
      method: metodo,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    sinConexion.value = !res.ok
    return res.ok ? res.json() : null
  } catch {
    sinConexion.value = true
    return null
  }
}

onMounted(async () => { config.value = await admin('GET', 'config') })

async function guardarConfig() {
  config.value = (await admin('PUT', 'config', config.value)) ?? config.value
}

async function otroUsuario() {
  const post = await admin('POST', 'otro-usuario')
  if (post) anotar('OTRO', `otro usuario: +5 likes a «${post.titulo.slice(0, 28)}…»`, 'srv')
}

async function restaurar() {
  const nueva = await admin('POST', 'restaurar')
  if (nueva) {
    config.value = nueva
    anotar('OTRO', 'servidor: datos y configuración iniciales', 'srv')
  }
}
</script>

<template>
  <section class="panel">
    <h3>Servidor</h3>
    <p v-if="sinConexion" class="error">No hay conexión con el servidor Express (¿está arrancado?)</p>
    <template v-if="config">
      <label>
        Latencia: <strong>{{ config.latenciaMs }} ms</strong>
        <input type="range" min="0" max="3000" step="100" v-model.number="config.latenciaMs" @change="guardarConfig" />
      </label>
      <label class="check">
        <input type="checkbox" v-model="config.likesFallan" @change="guardarConfig" /> Los likes fallan (500)
      </label>
    </template>
    <div class="botones">
      <button @click="otroUsuario">Otro usuario da +5 likes</button>
      <button @click="restaurar">Restaurar servidor</button>
    </div>
    <p class="nota">«Otro usuario» cambia los datos en el servidor: el cliente no se entera hasta que vuelva a pedirlos. «Restaurar» vuelve a los likes, la latencia y los fallos de partida.</p>
  </section>
</template>

<style scoped>
label { display: block; margin-bottom: 8px; }
input[type='range'] { width: 100%; }
.check { display: flex; gap: 6px; align-items: center; }
.botones { display: flex; flex-wrap: wrap; gap: 6px; }
.nota { font-size: 12px; color: var(--muted); margin: 6px 0 0; }
.error { font-size: 13px; margin: 0 0 8px; }
</style>

<script setup>
// Componente B del paso 1: necesita los mismos datos que A, así que repite la misma lógica
// (y hace su propia petición al servidor).
import { ref, computed, onMounted } from 'vue'
import { getPosts } from '@/api/posts'

const posts = ref([])
const cargando = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    posts.value = await getPosts()
  } catch (e) {
    error.value = e
  } finally {
    cargando.value = false
  }
})

const totalLikes = computed(() => posts.value.reduce((s, p) => s + p.likes, 0))
const masVotado = computed(() => posts.value.toSorted((a, b) => b.likes - a.likes)[0])
</script>

<template>
  <div class="box">
    <h3>B · Resumen</h3>
    <p v-if="cargando" class="cargando">Cargando…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <template v-else>
      <p class="total">{{ posts.length }} posts · <strong>{{ totalLikes }}</strong> likes en total</p>
      <p>Más votado: «{{ masVotado.titulo }}» (👍 {{ masVotado.likes }})</p>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePostsPage } from '@/queries/posts'

const page = ref(1)
const mantenerAnterior = ref(false)

const { data, isPending, isFetching, isPlaceholderData, isError, error } = usePostsPage(page, {
  staleTime: 30_000,
  // Lo habitual es escribir `placeholderData: keepPreviousData`, que equivale a (anterior) => anterior.
  // Aquí lo hacemos depender de un checkbox para poder comparar las dos opciones en clase.
  placeholderData: (anterior) => (mantenerAnterior.value ? anterior : undefined),
})
</script>

<template>
  <header class="paso-header">
    <h2>Paso 4 · Paginación: el parámetro va en la clave</h2>
    <p class="objetivo">Cada página es una entrada distinta de la caché: <code>['posts', 'page', 1]</code>, <code>['posts', 'page', 2]</code>…</p>
  </header>

  <div class="controles">
    <button @click="page--" :disabled="page === 1">← Anterior</button>
    <span>Página <strong>{{ page }}</strong> de {{ data?.totalPages ?? '…' }}</span>
    <button @click="page++" :disabled="isPlaceholderData || !data || page >= data.totalPages">Siguiente →</button>
    <span v-if="isFetching" class="chip fetching">cargando…</span>
    <label class="check"><input type="checkbox" v-model="mantenerAnterior" /> placeholderData: keepPreviousData</label>
  </div>

  <p v-if="isPending" class="cargando box">Cargando…</p>
  <p v-else-if="isError" class="error">{{ error.message }}</p>
  <ul v-else class="cards" :class="{ placeholder: isPlaceholderData }">
    <li v-for="p in data.items" :key="p.id" class="card">
      <h4>{{ p.titulo }}</h4>
      <p>{{ p.contenido }}</p>
      <span class="likes">👍 {{ p.likes }}</span>
    </li>
  </ul>
</template>

<style scoped>
.check { margin-left: auto; display: flex; gap: 6px; align-items: center; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 13px; }
.cards { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; transition: opacity .2s; }
.cards.placeholder { opacity: .4; }
.card h4 { margin: 0 0 4px; }
.card p { margin: 0 0 6px; color: var(--muted); }
</style>

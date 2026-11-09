<script setup>
// Componente B del paso 2: llama a la misma query que A (misma queryKey).
// No recibe props de A ni hay ningún store: comparten la entrada de la caché.
import { computed } from 'vue'
import { usePosts } from '@/queries/posts'

const { data: posts, isPending, isFetching, isError, error } = usePosts()

const totalLikes = computed(() => posts.value?.reduce((s, p) => s + p.likes, 0))
const masVotado = computed(() => posts.value?.toSorted((a, b) => b.likes - a.likes)[0])
</script>

<template>
  <div class="box">
    <h3>B · Resumen <span v-if="isFetching && !isPending" class="chip fetching">actualizando…</span></h3>
    <p v-if="isPending" class="cargando">Cargando…</p>
    <p v-else-if="isError" class="error">{{ error.message }}</p>
    <template v-else>
      <p class="total">{{ posts.length }} posts · <strong>{{ totalLikes }}</strong> likes en total</p>
      <p>Más votado: «{{ masVotado.titulo }}» (👍 {{ masVotado.likes }})</p>
    </template>
  </div>
</template>

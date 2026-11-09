<script setup>
// Otro componente que usa la misma query: se actualiza solo cuando cambia la caché,
// da igual si el cambio viene de un refetch o de un setQueryData optimista.
import { computed } from 'vue'
import { usePosts } from '@/queries/posts'

const { data: posts } = usePosts({ staleTime: 30_000 })
const top3 = computed(() => posts.value?.toSorted((a, b) => b.likes - a.likes).slice(0, 3) ?? [])
</script>

<template>
  <div class="box">
    <h3>Top 3</h3>
    <ol class="top">
      <li v-for="p in top3" :key="p.id">{{ p.titulo }} <strong>👍 {{ p.likes }}</strong></li>
    </ol>
  </div>
</template>

<style scoped>
.top { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
</style>

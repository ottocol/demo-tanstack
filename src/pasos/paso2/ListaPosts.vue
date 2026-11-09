<script setup>
// Componente A del paso 2: mismos datos que en el paso 1, ahora con useQuery.
import { computed } from 'vue'
import { usePosts } from '@/queries/posts'
import PostItem from '@/demo-ui/PostItem.vue'

// Sin opciones: staleTime = 0 (valor por defecto), los datos se consideran
// "viejos" (stale) en cuanto llegan.
const { data: posts, isPending, isFetching, isError, error } = usePosts()

const totalLikes = computed(() => posts.value?.reduce((s, p) => s + p.likes, 0))
</script>

<template>
  <div class="box">
    <h3>A · Lista <span v-if="isFetching && !isPending" class="chip fetching">actualizando…</span></h3>
    <p v-if="isPending" class="cargando">Cargando…</p>
    <p v-else-if="isError" class="error">{{ error.message }}</p>
    <template v-else>
      <p class="total">{{ posts.length }} posts · <strong>{{ totalLikes }}</strong> likes en total</p>
      <ul class="lista">
        <li v-for="p in posts" :key="p.id"><PostItem :post="p" /></li>
      </ul>
    </template>
  </div>
</template>

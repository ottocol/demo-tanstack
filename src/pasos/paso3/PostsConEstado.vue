<script setup>
import { computed } from 'vue'
import { usePosts } from '@/queries/posts'
import PostItem from '@/demo-ui/PostItem.vue'

const STALE_TIME = 10_000 // durante 10 s los datos son "frescos": no se vuelven a pedir
const GC_TIME = 20_000    // si nadie usa la query, a los 20 s se borra de la caché

const { data: posts, isPending, isFetching, isStale, dataUpdatedAt, isError, error } = usePosts({
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
})

const estado = computed(() => (isFetching.value ? 'fetching' : isStale.value ? 'stale' : 'fresh'))
const hora = computed(() => dataUpdatedAt.value ? new Date(dataUpdatedAt.value).toLocaleTimeString('es-ES', { hour12: false }) : '—')
const totalLikes = computed(() => posts.value?.reduce((s, p) => s + p.likes, 0))
</script>

<template>
  <div class="box">
    <h3>Posts <span :class="['chip', estado]">{{ estado }}</span></h3>
    <p class="config"><code>staleTime: {{ STALE_TIME / 1000 }} s</code> · <code>gcTime: {{ GC_TIME / 1000 }} s</code></p>
    <p v-if="isPending" class="cargando">Cargando…</p>
    <p v-else-if="isError" class="error">{{ error.message }}</p>
    <template v-else>
      <p class="total">Datos recibidos a las <strong>{{ hora }}</strong> · <strong>{{ totalLikes }}</strong> likes en total</p>
      <ul class="lista">
        <li v-for="p in posts" :key="p.id"><PostItem :post="p" /></li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.config { margin: 0 0 8px; font-size: 13px; }
</style>

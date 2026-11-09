<script setup>
// Componente A del paso 1: pide los posts "a mano", sin TanStack Query.
import { ref, computed, onMounted } from 'vue'
import { getPosts } from '@/api/posts'
import PostItem from '@/demo-ui/PostItem.vue'

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
</script>

<template>
  <div class="box">
    <h3>A · Lista</h3>
    <p v-if="cargando" class="cargando">Cargando…</p>
    <p v-else-if="error" class="error">{{ error.message }}</p>
    <template v-else>
      <p class="total">{{ posts.length }} posts · <strong>{{ totalLikes }}</strong> likes en total</p>
      <ul class="lista">
        <li v-for="p in posts" :key="p.id"><PostItem :post="p" /></li>
      </ul>
    </template>
  </div>
</template>

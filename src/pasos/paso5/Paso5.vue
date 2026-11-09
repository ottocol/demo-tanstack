<script setup>
import { ref, computed } from 'vue'
import { usePosts, useLikeInvalidando, useLikeOptimista } from '@/queries/posts'
import Ranking from './Ranking.vue'
import PostItem from '@/demo-ui/PostItem.vue'

const { data: posts, isPending, isFetching } = usePosts({ staleTime: 30_000 })

const modo = ref('invalidar') // 'invalidar' | 'optimista'
const likeInvalidando = useLikeInvalidando()
const likeOptimista = useLikeOptimista()
const like = computed(() => (modo.value === 'optimista' ? likeOptimista : likeInvalidando))

function darLike(id) {
  like.value.mutate(id)
}

// Solo deshabilitamos el botón del post que se está procesando, no todos
function procesando(id) {
  return like.value.isPending.value && like.value.variables.value === id
}
</script>

<template>
  <header class="paso-header">
    <h2>Paso 5 · Mutaciones: dar like</h2>
    <p class="objetivo"><code>useMutation</code> + invalidar la caché, y la versión con actualización optimista.</p>
  </header>

  <div class="controles">
    <label class="check"><input type="radio" value="invalidar" v-model="modo" /> Invalidar al terminar</label>
    <label class="check"><input type="radio" value="optimista" v-model="modo" /> Actualización optimista</label>
    <span v-if="isFetching" class="chip fetching">refetch…</span>
  </div>

  <p v-if="like.isError.value" class="error">
    {{ like.error.value.message }}<template v-if="modo === 'optimista'"> — se ha deshecho el cambio</template>
    <button class="mini" @click="like.reset()">×</button>
  </p>

  <div class="columnas">
    <div class="box">
      <h3>Posts</h3>
      <p v-if="isPending" class="cargando">Cargando…</p>
      <ul v-else class="lista">
        <li v-for="p in posts" :key="p.id">
          <PostItem :post="p">
            <button class="like" @click="darLike(p.id)" :disabled="procesando(p.id)">
              {{ procesando(p.id) ? '…' : '👍' }} {{ p.likes }}
            </button>
          </PostItem>
        </li>
      </ul>
    </div>
    <Ranking />
  </div>
</template>

<style scoped>
.check { display: flex; gap: 6px; align-items: center; }
.like { min-width: 64px; font-variant-numeric: tabular-nums; }
.mini { margin-left: 8px; padding: 0 6px; }
</style>

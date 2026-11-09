<script setup>
import { ref } from 'vue'
import ListaPosts from './ListaPosts.vue'
import ResumenPosts from './ResumenPosts.vue'

const mostrarB = ref(true)
</script>

<template>
  <header class="paso-header">
    <h2>Paso 2 · useQuery y caché compartida</h2>
    <p class="objetivo">Los mismos dos componentes, ahora con <code>useQuery</code> y la misma <code>queryKey</code>.</p>
  </header>

  <div class="controles">
    <button @click="mostrarB = !mostrarB">{{ mostrarB ? 'Ocultar B' : 'Mostrar B' }}</button>
  </div>

  <div class="columnas">
    <ListaPosts />
    <ResumenPosts v-if="mostrarB" />
  </div>
</template>

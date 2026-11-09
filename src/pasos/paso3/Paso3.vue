<script setup>
import { ref } from 'vue'
import PostsConEstado from './PostsConEstado.vue'

const mostrar = ref(true)
</script>

<template>
  <header class="paso-header">
    <h2>Paso 3 · staleTime y gcTime</h2>
    <p class="objetivo">Cuándo se vuelven a pedir los datos (<code>staleTime</code>) y cuándo se borran de la caché (<code>gcTime</code>).</p>
  </header>

  <div class="controles">
    <button @click="mostrar = !mostrar">{{ mostrar ? 'Desmontar componente' : 'Montar componente' }}</button>
  </div>

  <div class="columnas">
    <PostsConEstado v-if="mostrar" />
    <div v-else class="box vacio">Componente desmontado: la query sigue en la caché, pero inactiva (mira el panel «Caché»).</div>
  </div>
</template>

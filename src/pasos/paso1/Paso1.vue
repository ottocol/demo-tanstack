<script setup>
import { ref } from 'vue'
import ListaManual from './ListaManual.vue'
import ResumenManual from './ResumenManual.vue'

const mostrarB = ref(true)
</script>

<template>
  <header class="paso-header">
    <h2>Paso 1 · Sin TanStack Query</h2>
    <p class="objetivo">Dos componentes necesitan los mismos datos y cada uno los pide por su cuenta en <code>onMounted</code>.</p>
  </header>

  <div class="controles">
    <button @click="mostrarB = !mostrarB">{{ mostrarB ? 'Ocultar B' : 'Mostrar B' }}</button>
  </div>

  <div class="columnas">
    <ListaManual />
    <ResumenManual v-if="mostrarB" />
  </div>
</template>

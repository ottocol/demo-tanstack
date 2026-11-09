<script setup>
// Un post en los listados: el título se pliega/despliega para ver el contenido.
// Usa <details> nativo, así no hace falta estado en Vue.
// El slot permite sustituir el contador de likes (en el paso 5 es un botón).
defineProps({ post: { type: Object, required: true } })
</script>

<template>
  <div class="post-item">
    <details>
      <summary>{{ post.titulo }}</summary>
      <p class="contenido">{{ post.contenido }}</p>
    </details>
    <slot><span class="likes">👍 {{ post.likes }}</span></slot>
  </div>
</template>

<style scoped>
.post-item { display: flex; gap: 8px; align-items: flex-start; justify-content: space-between; }
details { flex: 1; min-width: 0; }
summary { cursor: pointer; padding: 2px 0; }
summary:hover { color: var(--accent); }
.contenido { margin: 4px 0 6px 16px; color: var(--muted); font-size: 13px; }
</style>

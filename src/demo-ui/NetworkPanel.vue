<script setup>
// Lista las peticiones de esta pestaña al API (lo mismo que la pestaña Red del navegador, en pequeño).
import { networkLog } from './networkLog'

const hora = (d) => d.toLocaleTimeString('es-ES', { hour12: false })
const limpiar = () => networkLog.splice(0)
</script>

<template>
  <section class="panel">
    <h3>Red <span class="count">({{ networkLog.filter((e) => e.metodo !== 'OTRO').length }} peticiones)</span>
      <button class="mini" @click="limpiar">Limpiar</button>
    </h3>
    <p v-if="!networkLog.length" class="vacio">Sin peticiones</p>
    <ol class="log">
      <li v-for="e in networkLog" :key="e.id" :class="['m-' + e.metodo, 'e-' + e.estado]">
        <span class="hora">{{ hora(e.hora) }}</span>
        <span class="metodo">{{ e.metodo }}</span>
        <span class="url">{{ e.url }}</span>
        <span class="estado">{{ e.estado }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
h3 { display: flex; align-items: center; gap: 6px; }
.count { font-weight: normal; color: var(--muted); font-size: 13px; }
.mini { margin-left: auto; font-size: 12px; padding: 2px 8px; }
.vacio { color: var(--muted); font-size: 13px; margin: 0; }
.log { list-style: none; margin: 0; padding: 0; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; max-height: 260px; overflow-y: auto; }
.log li { display: grid; grid-template-columns: auto 3.2em 1fr auto; gap: 6px; padding: 2px 0; border-bottom: 1px dashed var(--border); }
.metodo { font-weight: bold; }
.m-GET .metodo { color: var(--blue); }
.m-POST .metodo { color: var(--violet); }
.m-OTRO { color: var(--muted); font-style: italic; }
.url { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.e-… .estado { color: var(--amber); }
.e-200 .estado { color: var(--green); }
.e-500 .estado, .e-404 .estado, .e-error .estado { color: var(--red); font-weight: bold; }
.hora { color: var(--muted); }
</style>

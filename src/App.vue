<script setup>
import { RouterView, useRoute } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { pasos } from './router'
import ServerPanel from './demo-ui/ServerPanel.vue'
import NetworkPanel from './demo-ui/NetworkPanel.vue'
import CachePanel from './demo-ui/CachePanel.vue'

const route = useRoute()
</script>

<template>
  <div class="app">
    <nav class="menu">
      <strong class="marca">Micro-red social · TanStack Query</strong>
      <!-- Enlaces normales (no router-link) a propósito: recargan la página, así cada paso
           empieza con la caché vacía y los datos del servidor como al principio. -->
      <a v-for="p in pasos" :key="p.path" :href="p.path" :class="{ activo: route.path === p.path }">{{ p.titulo }}</a>
    </nav>

    <main class="contenido">
      <RouterView />
    </main>

    <aside class="lateral">
      <CachePanel />
      <NetworkPanel />
      <ServerPanel />
    </aside>
  </div>
  <VueQueryDevtools button-position="bottom-left" />
</template>

<style>
:root {
  --bg: #f6f7f9; --surface: #ffffff; --text: #1d2330; --muted: #667085; --border: #dfe3ea;
  --accent: #3b5bdb; --blue: #1c7ed6; --violet: #7048e8; --green: #2b8a3e; --amber: #e67700; --red: #c92a2a;
  --chip-fresh: #d3f9d8; --chip-stale: #fff3bf; --chip-fetching: #d0ebff; --chip-inactive: #e9ecef; --chip-error: #ffe3e3;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14171c; --surface: #1d2129; --text: #e6e9ef; --muted: #98a2b3; --border: #333a46;
    --accent: #91a7ff; --blue: #74c0fc; --violet: #b197fc; --green: #8ce99a; --amber: #ffc078; --red: #ff8787;
    --chip-fresh: #1f4d2a; --chip-stale: #5c4a0f; --chip-fetching: #12395c; --chip-inactive: #343a40; --chip-error: #5c1f1f;
    color-scheme: dark;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 15px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: .9em; background: var(--chip-inactive); padding: 1px 4px; border-radius: 4px; }
button { font: inherit; cursor: pointer; padding: 4px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
button:hover:not(:disabled) { border-color: var(--accent); }
button:disabled { opacity: .5; cursor: default; }

.app { display: grid; grid-template-columns: 1fr 380px; grid-template-rows: auto 1fr; min-height: 100vh; }
.menu { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: center; padding: 10px 20px; background: var(--surface); border-bottom: 1px solid var(--border); }
.marca { margin-right: 12px; }
.menu a { color: var(--muted); text-decoration: none; padding: 4px 0; border-bottom: 2px solid transparent; }
.menu a.activo { color: var(--accent); border-color: var(--accent); }
.contenido { padding: 20px; min-width: 0; }
.lateral { padding: 20px 20px 20px 0; display: grid; gap: 12px; align-content: start; }

.paso-header h2 { margin: 0 0 4px; }
.objetivo { margin: 0 0 16px; color: var(--muted); }
.controles { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 16px; }
.columnas { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; align-items: start; }

.box, .panel, .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
.box h3, .panel h3 { margin: 0 0 8px; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.box.vacio { color: var(--muted); font-style: italic; }
.total { margin: 0 0 8px; }
.cargando { color: var(--amber); font-weight: 600; }
.error { color: var(--red); font-weight: 600; }
.lista { list-style: none; margin: 0; padding: 0; font-size: 14px; }
.lista li { padding: 3px 0; border-bottom: 1px dashed var(--border); }
.likes { white-space: nowrap; font-variant-numeric: tabular-nums; }

.chip { display: inline-block; font: 600 11px/1 ui-monospace, Menlo, Consolas, monospace; padding: 3px 6px; border-radius: 999px; color: var(--text); }
.chip.fresh { background: var(--chip-fresh); }
.chip.stale { background: var(--chip-stale); }
.chip.fetching { background: var(--chip-fetching); }
.chip.inactive { background: var(--chip-inactive); }
.chip.error { background: var(--chip-error); }

@media (max-width: 900px) {
  .app { grid-template-columns: 1fr; }
  .lateral { padding: 0 16px 20px; }
  .contenido { padding: 16px; }
}
</style>

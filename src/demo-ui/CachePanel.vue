<script setup>
// Muestra en directo el contenido de la caché de TanStack Query: una fila por clave,
// con su estado, cuántos componentes la usan y la antigüedad de los datos.
// Hace lo mismo que las Devtools pero siempre visible y en pequeño (útil con el proyector).
import { ref, onMounted, onUnmounted } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'

const qc = useQueryClient()
const filas = ref([])
const inactivaDesde = new Map() // queryHash → momento en que se quedó sin observadores

function leer() {
  const ahora = Date.now()
  const queries = qc.getQueryCache().getAll()
  filas.value = queries.map((q) => {
    const obs = q.getObserversCount()
    if (obs > 0) inactivaDesde.delete(q.queryHash)
    else if (!inactivaDesde.has(q.queryHash)) inactivaDesde.set(q.queryHash, ahora)

    let estado
    if (q.state.fetchStatus === 'fetching') estado = 'fetching'
    else if (q.state.status === 'error') estado = 'error'
    else if (obs === 0) estado = 'inactive'
    else estado = q.isStale() ? 'stale' : 'fresh'

    const borradoEn = obs === 0 ? Math.max(0, Math.ceil((q.gcTime - (ahora - inactivaDesde.get(q.queryHash))) / 1000)) : null
    return {
      hash: q.queryHash,
      clave: JSON.stringify(q.queryKey),
      estado,
      obs,
      edad: q.state.dataUpdatedAt ? Math.floor((ahora - q.state.dataUpdatedAt) / 1000) : null,
      borradoEn,
    }
  })
  for (const hash of inactivaDesde.keys()) if (!queries.some((q) => q.queryHash === hash)) inactivaDesde.delete(hash)
}

let unsubscribe, timer
onMounted(() => {
  leer()
  unsubscribe = qc.getQueryCache().subscribe(() => queueMicrotask(leer))
  timer = setInterval(leer, 250)
})
onUnmounted(() => { unsubscribe?.(); clearInterval(timer) })
</script>

<template>
  <section class="panel">
    <h3>Caché de TanStack Query</h3>
    <p v-if="!filas.length" class="vacio">Vacía</p>
    <table v-else>
      <thead><tr><th>queryKey</th><th>estado</th><th title="componentes que la usan">obs.</th><th>datos</th></tr></thead>
      <tbody>
        <tr v-for="f in filas" :key="f.hash">
          <td class="clave">{{ f.clave }}</td>
          <td><span :class="['chip', f.estado]">{{ f.estado }}</span></td>
          <td class="num">{{ f.obs }}</td>
          <td class="edad">
            <template v-if="f.edad !== null">hace {{ f.edad }} s</template>
            <div v-if="f.borradoEn !== null" class="gc">se borra en {{ f.borradoEn }} s</div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.vacio { color: var(--muted); font-size: 13px; margin: 0; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
th { text-align: left; color: var(--muted); font-weight: normal; border-bottom: 1px solid var(--border); padding: 2px 4px; }
td { padding: 4px; border-bottom: 1px dashed var(--border); vertical-align: top; }
.clave { font-family: ui-monospace, Menlo, Consolas, monospace; word-break: break-all; }
.num { text-align: center; }
.edad { white-space: nowrap; color: var(--muted); }
.gc { color: var(--red); }
</style>

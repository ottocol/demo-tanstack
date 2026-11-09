# Demo de TanStack Query: micro-red social

Demo en clase de **TanStack Query** con Vue 3. Simula una micro-red social con *posts* y *likes*, con un pequeño API REST en Express. Va en **5 pasos**, uno por ruta, y cada paso enseña una sola idea:

| Paso | Ruta | Qué demuestra |
|---|---|---|
| 1 | `/1-sin-tanstack` | El problema: cada componente pide sus datos en `onMounted` |
| 2 | `/2-use-query` | `useQuery`: una sola petición y una caché compartida entre componentes |
| 3 | `/3-stale-gc` | `staleTime` (cuándo se vuelven a pedir los datos) y `gcTime` (cuándo se borran de la caché) |
| 4 | `/4-paginacion` | Los parámetros van en la `queryKey`. `placeholderData: keepPreviousData` |
| 5 | `/5-mutaciones` | `useMutation` + `invalidateQueries`, y la actualización optimista con *rollback* |

```bash
npm install
npm run dev
```

`npm run dev` arranca **dos procesos** a la vez (con `concurrently`): el API en Express (puerto 3001) y Vite. El proxy de Vite (`vite.config.js`) manda a Express todo lo que empieza por `/api`, así que el navegador solo ve un origen y no hace falta configurar CORS. Si Express no está arrancado, el panel «Servidor» lo avisa.

En **StackBlitz** funciona igual: [stackblitz.com/github/ottocol/client-blog-tanstack](https://stackblitz.com/github/ottocol/client-blog-tanstack) instala y ejecuta `npm run dev` (`.stackblitzrc`). Va mejor en Chrome o Edge.

## Antes de empezar: qué hay en pantalla

- **Izquierda**: el paso actual. En los listados se puede pulsar el título de un post para desplegar su contenido.
- **Panel «Caché de TanStack Query»**: muestra en directo cada entrada de la caché con su `queryKey`, su estado (`fresh`, `stale`, `fetching`, `inactive`), cuántos componentes la están usando (*obs.*), la antigüedad de los datos y, si está inactiva, cuánto falta para que se borre.
- **Panel «Red»**: las peticiones de esta pestaña al API, con su estado HTTP. Es lo mismo que la pestaña *Network* de las herramientas del navegador, que también se puede usar, pero en pequeño y siempre visible.
- **Panel «Servidor»**:
  - *Latencia*: 800 ms por defecto. Súbela si algo pasa demasiado rápido para verlo.
  - *Los likes fallan (500)*: hace que falle el `POST` de like. Se usa en el paso 5.
  - *Otro usuario da +5 likes*: cambia los datos **en el servidor** sin que el cliente se entere. Sirve para que, cuando se haga un refetch, se **vea** que llegan datos nuevos.
  - *Restaurar servidor*: vuelve a los likes de partida, a 800 ms de latencia y quita los fallos.
- **Botón de TanStack abajo a la izquierda**: abre las Devtools oficiales. Solo aparece con `npm run dev`.

> **La caché vive en la página y los datos en el servidor.** Al recargar, la caché de TanStack se pierde, pero los datos (y la configuración de latencia y fallos) siguen en Express. Solo se pierden al reiniciar el servidor o al pulsar *Restaurar servidor*.
>
> Los enlaces del menú **recargan la página** (son `<a>` normales, no `router-link`). Así cada paso empieza con la **caché vacía**, pero el servidor conserva los likes que se hayan dado. Para repetir un paso con la caché vacía, recarga la página.
>
> **Al empezar la clase, pulsa *Restaurar servidor***. Algunos pasos citan números concretos de likes (por ejemplo, el paso 5), y si se ha quedado marcado «Los likes fallan», el paso 5 no funciona como se espera.

## Dónde está el código

| Carpeta | ¿Se enseña? | Contenido |
|---|---|---|
| `src/queries/` | **Sí** | `keys.js` (las `queryKey`) y `posts.js` (`usePosts`, `usePostsPage`, las dos mutaciones de like) |
| `src/pasos/` | **Sí** | Un componente por paso |
| `src/api/posts.js` | Sí, de pasada | Las llamadas `fetch` al API, que son las `queryFn` y `mutationFn` (ver abajo) |
| `src/main.js` | Sí, de pasada | Creación del `QueryClient` y opciones globales |
| `server/` | No | API en Express: datos en memoria, latencia artificial, fallos simulados y rutas `/api/admin` para los controles del panel |
| `src/demo-ui/` | No | Los paneles laterales (el panel «Red» envuelve `window.fetch` para anotar las peticiones) |

**`fetch` y los errores.** `fetch` solo rechaza la promesa si falla la red. Si el servidor responde 404 o 500, la promesa **se resuelve igual**. Por eso la función `pedir()` de `src/api/posts.js` comprueba `res.ok` y lanza el error: si no lo hiciera, TanStack Query daría la petición por buena (en una query, guardaría en la caché el JSON del error como si fueran los datos). Vale la pena enseñarlo al llegar al fallo del paso 5.

Opciones globales en `main.js`: `refetchOnWindowFocus: false`, para que no se lance un refetch cada vez que vuelves de las transparencias al navegador, y `retry: false`, para que los errores se vean al momento. `staleTime` y `gcTime` se dejan con sus valores por defecto (0 y 5 min). Cada paso pone los suyos en el propio componente.

---

## Paso 1 · Sin TanStack Query

**Idea:** sin una capa de caché, cada componente se las arregla solo. El resultado son peticiones duplicadas, pantallas de carga repetidas y datos que no coinciden entre componentes.

**Código:** `src/pasos/paso1/ListaManual.vue` y `ResumenManual.vue`. Los dos repiten lo mismo: `ref` para los datos, `cargando` y `error`, más un `fetch` en `onMounted`.

**Pasos:**

1. Carga la página.
   → En «Red» aparecen **2 peticiones** `GET /posts`, una por componente, aunque los dos piden lo mismo.
2. Pulsa **Ocultar B** y luego **Mostrar B**.
   → B vuelve a mostrar **«Cargando…»** y hay **otra petición**. Los datos se tiraron al desmontar el componente.
3. Pulsa **Otro usuario da +5 likes**, y después **Ocultar B** y **Mostrar B**.
   → **A y B muestran totales de likes distintos**. B tiene los datos nuevos y A los viejos. Nadie avisa a A de que hay datos nuevos.

**Mensaje:** esto se podría arreglar a mano con un store (Pinia), pero entonces habría que decidir cuándo volver a pedir los datos, cuándo borrarlos, cómo evitar peticiones duplicadas… Eso es justo lo que hace TanStack Query.

## Paso 2 · useQuery y caché compartida

**Idea:** todos los componentes que usan la misma `queryKey` comparten **una sola entrada de la caché**. No hacen falta props ni store.

**Código:** `usePosts()` en `src/queries/posts.js` (`queryKey: ['posts']`) y `src/pasos/paso2/`. En este paso `usePosts()` se llama **sin opciones**, así que `staleTime` vale 0.

**Pasos:**

1. Carga la página.
   → **Una sola petición**, aunque hay dos componentes. En «Caché» hay una entrada `["posts"]` con **obs. = 2**. Su estado es `stale` desde el primer momento, porque con `staleTime: 0` los datos se consideran viejos en cuanto llegan.
2. Pulsa **Ocultar B**.
   → obs. pasa a 1. La entrada sigue en la caché.
3. Pulsa **Mostrar B**.
   → B aparece **al instante con datos**, sin «Cargando…». Aun así, en «Red» hay **otra petición** y los dos componentes muestran **«actualizando…»**. Como los datos estaban *stale*, TanStack enseña lo que tiene y lo actualiza en segundo plano (*stale-while-revalidate*).
4. Pulsa **Otro usuario da +5 likes** y repite Ocultar B y Mostrar B.
   → Mientras dura la petición, A y B muestran el total viejo. Al llegar la respuesta, **los dos cambian a la vez**: comparten la caché.

**Para explicar:** la diferencia entre `isPending` (no hay datos todavía, se ve «Cargando…») e `isFetching` (hay una petición en curso, aunque ya haya datos: se ve «actualizando…»). Son dos ejes independientes: `status` (¿tengo datos?) y `fetchStatus` (¿estoy pidiendo?). Existe también `isLoading`, que equivale a `isPending && isFetching`.

**Pregunta para la clase:** «¿Hace falta volver a pedir los datos cada vez que se monta B?» → paso 3.

## Paso 3 · staleTime y gcTime

**Idea:** son dos tiempos distintos que suelen confundirse.

- **`staleTime`**: cuánto tiempo los datos se consideran **frescos**. Mientras lo son, montar un componente **no** lanza ninguna petición.
- **`gcTime`**: cuánto tiempo se guarda en caché una query **que nadie está usando** (`inactive`). Pasado ese tiempo se **borra**, y la siguiente vez se vuelve a ver «Cargando…».

**Código:** `src/pasos/paso3/PostsConEstado.vue`, con `staleTime: 10 s` y `gcTime: 20 s` (valores bajos para que se pueda ver en clase). El chip junto al título muestra `fresh`, `stale` o `fetching`.

**Pasos:**

1. Carga la página.
   → 1 petición. Chip **`fresh`**.
2. Antes de que pasen 10 s, pulsa **Desmontar componente** y luego **Montar componente**.
   → Datos al instante y **ninguna petición nueva**. Mientras estuvo desmontado, la entrada aparecía `inactive` en «Caché» con la cuenta atrás «se borra en … s».
3. Espera a que el chip cambie a **`stale`** (a los 10 s de recibir los datos).
   → No pasa nada más: ponerse *stale* **no** lanza ninguna petición. Solo marca que la próxima ocasión (montar, refetch…) toca pedir.
4. Pulsa **Otro usuario da +5 likes** y después **Desmontar** y **Montar**.
   → Datos al instante y **petición en segundo plano** (chip `fetching`). Al terminar, el total de likes cambia.
5. Pulsa **Desmontar** y **espera más de 20 s** mirando el panel «Caché».
   → La cuenta atrás llega a 0 y **la entrada desaparece**.
6. Pulsa **Montar componente**.
   → **«Cargando…»** otra vez, como la primera vez: la caché estaba vacía.

**Mensaje:** `staleTime` decide **cuándo se vuelve a pedir**. `gcTime` decide **cuándo se olvida**. Con los valores por defecto (`staleTime: 0`, `gcTime: 5 min`) se pide casi siempre, pero casi nunca se ve «Cargando…».

## Paso 4 · Paginación: el parámetro va en la clave

**Idea:** la `queryKey` **identifica los datos**. Si los datos dependen de un parámetro (página, id, filtro…), ese parámetro **tiene que** ir en la clave. Cada página es entonces una entrada distinta de la caché.

**Código:** `usePostsPage(page)` en `src/queries/posts.js`, con `queryKey: ['posts', 'page', page]`, donde `page` es un `ref`. Cuando cambia el `ref`, cambia la clave y TanStack busca esa página en la caché. El componente está en `src/pasos/paso4/Paso4.vue` (`staleTime: 30 s`).

**Pasos:**

1. Carga la página.
   → `GET /posts?page=1…`. En «Caché»: `["posts","page",1]`.
2. Pulsa **Siguiente**.
   → **«Cargando…»** (la lista desaparece) y aparece una entrada nueva `["posts","page",2]`. La de la página 1 queda `inactive`.
3. Pulsa **Anterior**.
   → La página 1 aparece **al instante y sin petición**: está en la caché y sigue fresca (menos de 30 s).
4. Marca **placeholderData: keepPreviousData** y pulsa **Siguiente** hasta llegar a una página que no se haya visitado.
   → En vez de «Cargando…», **se sigue viendo la página anterior atenuada** hasta que llega la nueva. «Siguiente» se desactiva mientras tanto (`isPlaceholderData`). La lista no salta.

**Error típico que comentar:** poner `queryKey: ['posts']` y usar `page` solo dentro de `queryFn`. En ese caso todas las páginas comparten la misma entrada y se machacan unas a otras.

## Paso 5 · Mutaciones: dar like

**Idea:** para **modificar** datos se usa `useMutation`. Después hay que poner la caché al día, y hay dos formas de hacerlo:

- **Invalidar al terminar** (`useLikeInvalidando`): esperar al servidor y luego `invalidateQueries(['posts'])`. Las queries afectadas se marcan *stale* y las que están montadas se vuelven a pedir. Es sencillo y siempre correcto, pero lento.
- **Actualización optimista** (`useLikeOptimista`): cambiar la caché **antes** de que responda el servidor con `setQueryData`, guardar lo que había en `onMutate`, restaurarlo en `onError` e invalidar en `onSettled`. Es inmediato, pero tiene más código.

**Código:** `src/queries/posts.js` (las dos mutaciones, con los pasos numerados en los comentarios) y `src/pasos/paso5/`. El componente **Top 3** (`Ranking.vue`) usa la misma query que la lista. No recibe nada de ella.

**Pasos:**

1. Con **Invalidar al terminar** seleccionado, da like a cualquier post.
   → El botón muestra «…» y el número **no cambia** hasta pasados ~1,6 s. En «Red» se ve un `POST /posts/:id/like` y **después** un `GET /posts`: el número que se muestra es el que devuelve el refetch.
2. Pulsa **Otro usuario da +5 likes** y luego da un like.
   → Al invalidar llegan **también** los cambios del otro usuario. La caché queda igual que el servidor.
3. Selecciona **Actualización optimista** y da like.
   → El número **sube al instante**. El `POST` y el `GET` siguen pasando por detrás.
4. Da like varias veces a «Node_modules y el agujero negro…» (17) hasta que supere a «Cuando el profesor explicó staleTime…» (18).
   → **El Top 3 se reordena solo**: depende de la misma entrada de la caché.
5. Marca **Los likes fallan (500)** en el panel Servidor y da like.
   → El número sube… y a los ~0,8 s **vuelve a bajar** (*rollback* en `onError`). Aparece el mensaje de error y en «Red» se ve el `500`.

**Mensaje:** primero, la versión que invalida, porque en la mayoría de los casos basta. La optimista es para cuando la espera se nota mucho (likes, checkboxes, reordenar…). Hay que justificarla, porque obliga a duplicar en el cliente la lógica del servidor (aquí, «sumar 1»).

---

## Ampliaciones (si sobra tiempo)

- **`refetchOnWindowFocus`**: ponlo a `true` en `main.js`, cambia a otra ventana y vuelve. Si los datos están *stale*, se vuelven a pedir.
- **Dos usuarios de verdad**: abre la demo en **dos pestañas**. Comparten el servidor, pero cada una tiene su caché. Si das likes en una, la otra no se entera hasta que vuelva a pedir los datos. Combinado con `refetchOnWindowFocus: true`, basta con cambiar de pestaña para que se actualice.
- **Quitar la comprobación de `res.ok`** en `src/api/posts.js` y repetir el fallo del paso 5: el error pasa desapercibido. No hay mensaje ni *rollback*: el número sube y, cuando llega el refetch de `onSettled`, vuelve a bajar sin que nadie sepa por qué.
- **Precargar la página siguiente** en el paso 4: `queryClient.prefetchQuery({ queryKey: qk.postsPage(page + 1), queryFn: … })`. Al pulsar «Siguiente», la página ya está en la caché.
- **`select`**: transformar los datos de la query en el propio `useQuery`, por ejemplo para el Top 3, en lugar de con un `computed`.
- **Scroll infinito** (`useInfiniteQuery`): se ha dejado fuera a propósito. Cambia la forma de los datos (`data.pages`), lo que complica las actualizaciones optimistas y los refetch, y no aporta nada nuevo sobre la caché.

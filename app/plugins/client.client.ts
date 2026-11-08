// Client-only: page-view analytics, PWA service worker, and card hover spotlight.
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const baseURL = useApiBase()

  const track = (path: string) => {
    if (path.startsWith('/admin')) return
    $fetch('/api/track', { method: 'POST', body: { path }, baseURL }).catch(() => {})
  }
  track(router.currentRoute.value.path)
  router.afterEach((to, from) => {
    if (to.path !== from.path) track(to.path)
  })

  if ('serviceWorker' in navigator && !import.meta.dev)
    navigator.serviceWorker.register('/sw.js').catch(() => {})

  // spotlight that follows the cursor on .card-glow elements
  window.addEventListener('pointermove', (e) => {
    const el = (e.target as HTMLElement)?.closest?.('.card-glow') as HTMLElement | null
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, { passive: true })
})

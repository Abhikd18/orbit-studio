// Protects /admin pages. Runs on server (SSR) and client navigation.
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return
  const { admin } = await useRequestFetch()('/api/admin/me').catch(() => ({ admin: false }))
  if (!admin) return navigateTo(`/admin/login?next=${encodeURIComponent(to.fullPath)}`)
})

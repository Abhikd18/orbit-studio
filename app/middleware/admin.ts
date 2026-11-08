// Protects /admin pages. Runs on server (SSR) and client navigation.
const PUBLIC = ['/admin/login', '/admin/forgot', '/admin/reset']

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC.includes(to.path)) return
  const { admin } = await useRequestFetch()('/api/admin/me').catch(() => ({ admin: false }))
  if (!admin) return navigateTo(`/admin/login?next=${encodeURIComponent(to.fullPath)}`)
})

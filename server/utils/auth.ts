import type { H3Event } from 'h3'

const DEMO_PASSWORD = 'orbit-admin'
const DEMO_SECRET = 'orbit-demo-secret-change-me-please-32-chars-min'

export function adminPassword(event: H3Event) {
  return useRuntimeConfig(event).adminPassword || process.env.ADMIN_PASSWORD || DEMO_PASSWORD
}

export function adminSession(event: H3Event) {
  const secret = useRuntimeConfig(event).sessionSecret || process.env.SESSION_SECRET || DEMO_SECRET
  return useSession<{ admin?: boolean }>(event, {
    name: 'orbit_admin',
    password: secret,
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, sameSite: 'lax', secure: !import.meta.dev && process.env.NODE_ENV === 'production' && !!process.env.VERCEL },
  })
}

export async function requireAdmin(event: H3Event) {
  const session = await adminSession(event)
  if (!session.data.admin) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

import type { H3Event } from 'h3'

const DEMO_PASSWORD = 'orbit-admin'
const DEMO_SECRET = 'orbit-demo-secret-change-me-please-32-chars-min'

export function adminPassword(event: H3Event) {
  return useRuntimeConfig(event).adminPassword || process.env.ADMIN_PASSWORD || DEMO_PASSWORD
}

/** Email that receives password-reset links and lead alerts. */
export const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase()

export function adminSession(event: H3Event) {
  const secret = useRuntimeConfig(event).sessionSecret || process.env.SESSION_SECRET || DEMO_SECRET
  return useSession<{ admin?: boolean, v?: number }>(event, {
    name: 'orbit_admin',
    password: secret,
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, sameSite: 'lax', secure: !import.meta.dev && process.env.NODE_ENV === 'production' && !!process.env.VERCEL },
  })
}

export async function isAdmin(event: H3Event) {
  const session = await adminSession(event)
  if (!session.data.admin) return false
  // sessions from before the last password change are no longer valid
  return (session.data.v ?? 0) === (await getAuthState()).version
}

export async function requireAdmin(event: H3Event) {
  if (!(await isAdmin(event))) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
}

export async function startAdminSession(event: H3Event) {
  const session = await adminSession(event)
  await session.update({ admin: true, v: (await getAuthState()).version })
}

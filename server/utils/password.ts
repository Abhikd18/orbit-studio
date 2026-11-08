import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * Admin password model
 * - The env password (NUXT_ADMIN_PASSWORD in Vercel) is the initial / recovery password.
 * - Changing the password in the admin (or via email reset) stores a scrypt hash in the DB,
 *   which then replaces the env password.
 * - Recovery without email: change NUXT_ADMIN_PASSWORD in Vercel → the new env value wins again.
 * - Every password change bumps `version`, which logs out all existing sessions.
 */
interface AuthState { hash?: string, envFingerprint?: string, version: number }

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const db = () => useStorage('db')

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`
}

function verifyHash(pw: string, stored: string) {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const a = scryptSync(pw, salt, 64)
  const b = Buffer.from(key, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(sha256(a))
  const y = Buffer.from(sha256(b))
  return timingSafeEqual(x, y)
}

export async function getAuthState(): Promise<AuthState> {
  return (await db().getItem<AuthState>('auth')) || { version: 0 }
}

export async function checkPassword(event: H3Event, pw: string) {
  const envPw = adminPassword(event)
  const state = await getAuthState()
  // A DB password exists and the env password hasn't been rotated since → DB password only.
  if (state.hash && state.envFingerprint === sha256(envPw)) return verifyHash(pw, state.hash)
  // Otherwise the env password is in charge (first run, or owner rotated it in Vercel).
  if (!safeEqual(pw, envPw)) return false
  if (state.hash) await db().setItem('auth', { version: state.version + 1 }) // recovery: drop stale DB password
  return true
}

export async function setPassword(event: H3Event, pw: string) {
  if (pw.length < 8) throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  const state = await getAuthState()
  const next: AuthState = { hash: hashPassword(pw), envFingerprint: sha256(adminPassword(event)), version: state.version + 1 }
  await db().setItem('auth', next)
  return next.version
}

// ---- reset tokens (single use, 30 min) ----
export async function createResetToken() {
  const token = randomBytes(32).toString('hex')
  await db().setItem('auth:reset', { hash: sha256(token), expires: Date.now() + 30 * 60e3 })
  return token
}

export async function consumeResetToken(token: string) {
  const rec = await db().getItem<{ hash: string, expires: number }>('auth:reset')
  if (!rec || rec.expires < Date.now() || !safeEqual(rec.hash, sha256(token))) return false
  await db().removeItem('auth:reset')
  return true
}

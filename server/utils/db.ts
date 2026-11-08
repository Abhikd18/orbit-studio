import { seed } from './seed'

export const COLLECTIONS = ['services', 'projects', 'testimonials', 'messages', 'faqs', 'posts'] as const
export type CollectionName = (typeof COLLECTIONS)[number]
/** Collections whose items get a public URL slug. */
export const SLUGGED: CollectionName[] = ['projects', 'posts']

const SEED_VERSION = 'seeded:v2'
const db = () => useStorage('db')

/**
 * Seeds any key that doesn't exist yet. Existing data (e.g. your edited
 * projects in Redis) is never overwritten, so new features can add new keys safely.
 */
async function ensureSeeded() {
  const s = db()
  if (await s.hasItem(SEED_VERSION)) return
  const keys = ['settings', 'estimator', ...COLLECTIONS] as const
  await Promise.all(keys.map(async (k) => {
    if (!(await s.hasItem(k))) await s.setItem(k, (seed as any)[k])
  }))
  await s.setItem(SEED_VERSION, true)
}

export async function getSettings() {
  await ensureSeeded()
  return { ...seed.settings, ...((await db().getItem<any>('settings')) || {}) }
}

export async function saveSettings(data: Record<string, any>) {
  const next = { ...(await getSettings()), ...data }
  await db().setItem('settings', next)
  return next
}

export async function getEstimator() {
  await ensureSeeded()
  return { ...seed.estimator, ...((await db().getItem<any>('estimator')) || {}) } as typeof seed.estimator
}

export async function saveEstimator(data: typeof seed.estimator) {
  await db().setItem('estimator', data)
  return data
}

export async function getCollection<T = any>(name: CollectionName): Promise<T[]> {
  await ensureSeeded()
  return ((await db().getItem<T[]>(name)) || []) as T[]
}

export async function saveCollection(name: CollectionName, items: any[]) {
  await db().setItem(name, items)
}

export function assertCollection(name: string): CollectionName {
  if (!(COLLECTIONS as readonly string[]).includes(name))
    throw createError({ statusCode: 404, statusMessage: 'Unknown collection' })
  return name as CollectionName
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || uid()

/** Unique slug within a collection (ignores the item at index `self`). */
export function uniqueSlug(items: any[], wanted: string, self = -1) {
  let slug = slugify(wanted)
  if (items.some((p, j) => j !== self && p.slug === slug)) slug += '-' + uid().slice(-4)
  return slug
}

/** Image fields may only hold https URLs (blocks javascript: and similar). */
export const safeImageUrl = (v: unknown) => (typeof v === 'string' && /^https:\/\/[^\s"'<>]+$/.test(v) ? v : '')

export function sanitizeImages(item: Record<string, any>) {
  for (const key of ['image']) if (key in item) item[key] = safeImageUrl(item[key])
  if ('gallery' in item) item.gallery = (Array.isArray(item.gallery) ? item.gallery : []).map(safeImageUrl).filter(Boolean).slice(0, 20)
  return item
}

// ---- blog scheduling ----
/** A post is live when published AND its publishAt time (if any) has passed. */
export const isLive = (p: any) =>
  !!p.published && (!p.publishAt || new Date(p.publishAt).getTime() <= Date.now())

export const postTime = (p: any) => String(p.publishAt || p.date || '')

/** Calendar date (IST) for display, derived from publishAt. */
export const istDate = (iso: string) =>
  new Date(new Date(iso).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10)

/** Validates publishAt and keeps the display date in sync with it. */
export function normalizePost(p: any) {
  if (p.publishAt) {
    const t = new Date(p.publishAt)
    if (Number.isNaN(t.getTime())) throw createError({ statusCode: 400, statusMessage: 'Invalid publish time' })
    p.publishAt = t.toISOString()
    p.date = istDate(p.publishAt)
  }
  else {
    p.publishAt = ''
    if (!p.date) p.date = istDate(new Date().toISOString())
  }
  return p
}

export function livePosts(posts: any[]) {
  return posts.filter(isLive).sort((a, b) => postTime(b).localeCompare(postTime(a)))
}

// ---- analytics (page views per day + per page) ----
export async function trackView(path: string) {
  const day = new Date().toISOString().slice(0, 10)
  const views = (await db().getItem<Record<string, number>>('views')) || {}
  views[day] = (views[day] || 0) + 1
  const pages = (await db().getItem<Record<string, number>>('pages')) || {}
  pages[path] = (pages[path] || 0) + 1
  await Promise.all([db().setItem('views', views), db().setItem('pages', pages)])
}

export async function getViews() {
  return {
    views: (await db().getItem<Record<string, number>>('views')) || {},
    pages: (await db().getItem<Record<string, number>>('pages')) || {},
  }
}

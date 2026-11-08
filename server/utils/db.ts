import { seed } from './seed'

export const COLLECTIONS = ['services', 'projects', 'testimonials', 'messages'] as const
export type CollectionName = (typeof COLLECTIONS)[number]

const db = () => useStorage('db')

async function ensureSeeded() {
  const s = db()
  if (await s.hasItem('seeded')) return
  await Promise.all([
    s.setItem('settings', seed.settings),
    ...COLLECTIONS.map(c => s.setItem(c, (seed as any)[c])),
  ])
  await s.setItem('seeded', true)
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

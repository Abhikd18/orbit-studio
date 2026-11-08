import upstashDriver from 'unstorage/drivers/upstash'
import memoryDriver from 'unstorage/drivers/memory'

/**
 * Picks the database at runtime:
 *  - Upstash Redis (free tier) when KV_REST_API_URL / KV_REST_API_TOKEN are set
 *    (Vercel sets these automatically when you connect Upstash from the Marketplace)
 *  - In-memory fallback otherwise, so the site always works out of the box.
 * Local dev uses ./.data/db (see nuxt.config.ts devStorage).
 */
export default defineNitroPlugin(() => {
  if (import.meta.dev) return
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  const storage = useStorage()
  if (storage.getMount('db:').base === 'db:') return // already configured (e.g. prerender)
  if (url && token) {
    storage.mount('db', upstashDriver({ url, token, base: 'orbit' }))
    console.info('[orbit] database: Upstash Redis')
  }
  else {
    storage.mount('db', memoryDriver())
    console.warn('[orbit] database: in-memory (connect Upstash Redis for persistence)')
  }
})

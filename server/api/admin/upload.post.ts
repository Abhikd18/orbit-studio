import { put } from '@vercel/blob'

// Image upload for the admin → Vercel Blob (free tier). Returns a public https URL.
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
}
const MAX = 4 * 1024 * 1024 // Vercel functions accept ~4.5 MB bodies; the browser compresses first

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw createError({ statusCode: 503, statusMessage: 'Image storage is not configured (BLOB_READ_WRITE_TOKEN missing)' })

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file')
  if (!file?.data?.length) throw createError({ statusCode: 400, statusMessage: 'No file received' })
  const ext = TYPES[file.type || '']
  if (!ext) throw createError({ statusCode: 415, statusMessage: 'Please upload a JPG, PNG, WebP, AVIF or GIF image' })
  if (file.data.length > MAX) throw createError({ statusCode: 413, statusMessage: 'Image is too large (max 4 MB)' })

  const folder = String(getQuery(event).folder || 'uploads').replace(/[^a-z0-9-]/gi, '').slice(0, 30) || 'uploads'
  const blob = await put(`${folder}/${Date.now().toString(36)}-${uid()}.${ext}`, file.data, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  })
  return { url: blob.url }
})

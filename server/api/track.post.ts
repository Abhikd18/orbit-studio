export default defineEventHandler(async (event) => {
  const { path } = (await readBody<{ path?: string }>(event)) || {}
  if (typeof path === 'string' && path.length < 200 && !path.startsWith('/admin')) await trackView(path)
  return { ok: true }
})

// Change password while logged in. Logs out all other sessions.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { current, next } = (await readBody<{ current?: string, next?: string }>(event)) || {}
  if (!current || !(await checkPassword(event, String(current))))
    throw createError({ statusCode: 400, statusMessage: 'Current password is wrong' })
  await setPassword(event, String(next || ''))
  await startAdminSession(event) // keep this device logged in
  return { ok: true }
})

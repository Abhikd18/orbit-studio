export default defineEventHandler(async (event) => {
  const { token, password } = (await readBody<{ token?: string, password?: string }>(event)) || {}
  if (String(password || '').length < 8)
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  if (!token || !(await consumeResetToken(String(token))))
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired. Request a new one.' })
  await setPassword(event, String(password))
  await startAdminSession(event)
  return { ok: true }
})

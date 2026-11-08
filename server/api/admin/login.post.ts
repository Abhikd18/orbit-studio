export default defineEventHandler(async (event) => {
  const { password } = (await readBody<{ password?: string }>(event)) || {}
  if (!password || !(await checkPassword(event, String(password)))) {
    await new Promise(r => setTimeout(r, 600)) // slow down brute force
    throw createError({ statusCode: 401, statusMessage: 'Wrong password' })
  }
  await startAdminSession(event)
  return { ok: true }
})

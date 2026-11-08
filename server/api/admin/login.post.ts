export default defineEventHandler(async (event) => {
  const { password } = (await readBody<{ password?: string }>(event)) || {}
  if (!password || password !== adminPassword(event)) {
    await new Promise(r => setTimeout(r, 600)) // slow down brute force
    throw createError({ statusCode: 401, statusMessage: 'Wrong password' })
  }
  const session = await adminSession(event)
  await session.update({ admin: true })
  return { ok: true }
})

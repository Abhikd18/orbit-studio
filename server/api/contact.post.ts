export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, string>>(event)
  const name = String(body?.name || '').trim().slice(0, 120)
  const email = String(body?.email || '').trim().slice(0, 200)
  const message = String(body?.message || '').trim().slice(0, 4000)
  const budget = String(body?.budget || '').trim().slice(0, 60)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5)
    throw createError({ statusCode: 400, statusMessage: 'Please provide your name, a valid email and a message.' })
  const messages = await getCollection<any>('messages')
  messages.unshift({ id: uid(), name, email, budget, message, read: false, createdAt: new Date().toISOString() })
  await saveCollection('messages', messages.slice(0, 500))
  return { ok: true }
})

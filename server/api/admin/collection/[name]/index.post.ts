export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const body = (await readBody<Record<string, any>>(event)) || {}
  const items = await getCollection<any>(name)
  const item = { ...body, id: uid() }
  if (SLUGGED.includes(name)) item.slug = uniqueSlug(items, body.slug || body.title || '')
  if (name === 'posts' && !item.date) item.date = new Date().toISOString().slice(0, 10)
  items.unshift(item)
  await saveCollection(name, items)
  return item
})

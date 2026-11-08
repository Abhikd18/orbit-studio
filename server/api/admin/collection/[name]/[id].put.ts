export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const id = getRouterParam(event, 'id')
  const body = (await readBody<Record<string, any>>(event)) || {}
  const items = await getCollection<any>(name)
  const i = items.findIndex(x => x.id === id)
  if (i === -1) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  items[i] = sanitizeImages({ ...items[i], ...body, id })
  if (SLUGGED.includes(name)) items[i].slug = uniqueSlug(items, items[i].slug || items[i].title || '', i)
  if (name === 'posts') normalizePost(items[i])
  await saveCollection(name, items)
  return items[i]
})

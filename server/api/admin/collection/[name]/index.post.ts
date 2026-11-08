export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const body = (await readBody<Record<string, any>>(event)) || {}
  const items = await getCollection<any>(name)
  const item = sanitizeImages({ ...body, id: uid() })
  if (SLUGGED.includes(name)) item.slug = uniqueSlug(items, body.slug || body.title || '')
  if (name === 'posts') normalizePost(item)
  items.unshift(item)
  await saveCollection(name, items)
  return item
})

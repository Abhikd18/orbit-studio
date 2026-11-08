export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const body = (await readBody<Record<string, any>>(event)) || {}
  const items = await getCollection<any>(name)
  const item = { ...body, id: uid() }
  if (name === 'projects') {
    item.slug = slugify(body.slug || body.title || '')
    if (items.some(p => p.slug === item.slug)) item.slug += '-' + uid().slice(-4)
  }
  items.unshift(item)
  await saveCollection(name, items)
  return item
})

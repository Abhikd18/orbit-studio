export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const id = getRouterParam(event, 'id')
  const body = (await readBody<Record<string, any>>(event)) || {}
  const items = await getCollection<any>(name)
  const i = items.findIndex(x => x.id === id)
  if (i === -1) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  items[i] = { ...items[i], ...body, id }
  if (name === 'projects') {
    let slug = slugify(items[i].slug || items[i].title || '')
    if (items.some((p, j) => j !== i && p.slug === slug)) slug += '-' + uid().slice(-4)
    items[i].slug = slug
  }
  await saveCollection(name, items)
  return items[i]
})

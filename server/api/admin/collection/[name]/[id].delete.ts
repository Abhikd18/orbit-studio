export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const name = assertCollection(getRouterParam(event, 'name')!)
  const id = getRouterParam(event, 'id')
  const items = await getCollection<any>(name)
  await saveCollection(name, items.filter(x => x.id !== id))
  return { ok: true }
})

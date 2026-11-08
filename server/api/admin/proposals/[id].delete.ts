export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  await saveProposals((await getProposals()).filter(p => p.id !== id))
  return { ok: true }
})

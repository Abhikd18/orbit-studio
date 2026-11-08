export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const p = (await getProposals()).find(x => x.id === getRouterParam(event, 'id'))
  if (!p) throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  return { ...p, ...totals(p) }
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const list = await getProposals()
  return list
    .map(p => ({ ...p, total: totals(p).total }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

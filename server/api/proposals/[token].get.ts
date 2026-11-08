// Public proposal view. Drafts are only visible to the logged-in admin (preview).
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const token = String(getRouterParam(event, 'token') || '')
  const list = await getProposals()
  const p = list.find(x => x.token === token)
  const admin = await isAdmin(event)
  if (!p || (p.status === 'draft' && !admin)) throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })

  // first view by the client (not the admin) → mark as viewed
  if (!admin && p.status === 'sent') {
    p.status = 'viewed'
    p.viewedAt = new Date().toISOString()
    await saveProposals(list)
  }
  return { ...publicProposal(p, await getSettings()), preview: admin }
})

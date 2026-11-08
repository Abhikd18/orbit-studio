// Edit a proposal, or change its status with { action: 'send' | 'reopen' }.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = (await readBody<any>(event)) || {}
  const list = await getProposals()
  const i = list.findIndex(x => x.id === id)
  if (i === -1) throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  const p = list[i]!

  if (['accepted', 'declined'].includes(p.status) && body.action !== 'reopen')
    throw createError({ statusCode: 409, statusMessage: 'This proposal has been answered by the client. Reopen it to make changes.' })

  Object.assign(p, cleanProposalInput(body))

  if (body.action === 'send') {
    if (!p.clientName || !p.items.length) throw createError({ statusCode: 400, statusMessage: 'Add a client name and at least one item before sending' })
    p.status = p.status === 'viewed' ? 'viewed' : 'sent'
    p.sentAt ||= new Date().toISOString()
    await setLeadStatus(p.leadId, 'proposal', totals(p).total)
  }
  if (body.action === 'reopen') {
    Object.assign(p, { status: 'draft', respondedAt: undefined, signedName: undefined, clientComment: undefined })
  }
  await saveProposals(list)
  return { ...p, ...totals(p) }
})

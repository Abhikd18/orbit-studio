// Client accepts (e-signs by typing their name) or declines a proposal.
export default defineEventHandler(async (event) => {
  const token = String(getRouterParam(event, 'token') || '')
  const { action, name, comment } = (await readBody<any>(event)) || {}
  if (!['accept', 'decline'].includes(action)) throw createError({ statusCode: 400, statusMessage: 'Invalid action' })

  const list = await getProposals()
  const p = list.find(x => x.token === token)
  if (!p || p.status === 'draft') throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })
  if (['accepted', 'declined'].includes(p.status)) throw createError({ statusCode: 409, statusMessage: 'This proposal has already been answered' })
  if (p.validUntil && p.validUntil < new Date().toISOString().slice(0, 10))
    throw createError({ statusCode: 410, statusMessage: 'This proposal has expired. Please ask us for an updated one.' })

  const signedName = String(name || '').trim().slice(0, 120)
  if (action === 'accept' && signedName.length < 2) throw createError({ statusCode: 400, statusMessage: 'Please type your full name to accept' })

  const { total } = totals(p)
  Object.assign(p, {
    status: action === 'accept' ? 'accepted' : 'declined',
    respondedAt: new Date().toISOString(),
    signedName: action === 'accept' ? signedName : undefined,
    clientComment: String(comment || '').trim().slice(0, 2000) || undefined,
  })
  await saveProposals(list)
  await setLeadStatus(p.leadId, action === 'accept' ? 'won' : 'lost', total)

  if (emailConfigured()) {
    try {
      const s = await getSettings()
      const money = `${p.currency}${total.toLocaleString('en-IN')}`
      await sendEmail({
        to: adminEmail(),
        replyTo: p.clientEmail || undefined,
        subject: action === 'accept'
          ? `🎉 ${p.clientName} accepted “${p.title}” (${money})`
          : `${p.clientName} declined “${p.title}”`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
          <h2>${action === 'accept' ? 'Proposal accepted' : 'Proposal declined'}</h2>
          <p><b>${escapeHtml(p.title)}</b> for ${escapeHtml(p.clientName)} — ${escapeHtml(money)}</p>
          ${action === 'accept' ? `<p>Signed as: <b>${escapeHtml(signedName)}</b></p>` : ''}
          ${p.clientComment ? `<p style="white-space:pre-wrap;background:#f5f5f7;padding:14px;border-radius:10px">${escapeHtml(p.clientComment)}</p>` : ''}
          <p><a href="${getRequestURL(event).origin}/admin/proposals/${p.id}">Open in ${escapeHtml(s.brandName)} admin</a></p>
        </div>`,
      })
    }
    catch (e) {
      console.error('[orbit] proposal email failed', e)
    }
  }
  return { ok: true, status: p.status }
})

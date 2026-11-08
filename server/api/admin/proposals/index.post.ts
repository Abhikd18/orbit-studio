import type { Proposal } from '../../../utils/proposals'

// Creates a draft proposal, optionally pre-filled from a lead.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = (await readBody<any>(event)) || {}
  const [settings, estimator, leads] = await Promise.all([getSettings(), getEstimator(), getCollection<any>('messages')])
  const lead = body.leadId ? leads.find(l => l.id === body.leadId) : null

  const valid = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10)
  const proposal: Proposal = {
    id: uid(),
    token: newToken(),
    leadId: lead?.id || '',
    clientName: lead?.name || '',
    clientEmail: lead?.email || '',
    clientCompany: '',
    title: lead?.budget && !lead.budget.startsWith('Estimate') ? `${lead.budget} proposal` : 'Project proposal',
    intro: `Hi ${lead?.name?.split(' ')[0] || 'there'},\n\nThank you for considering ${settings.brandName}. Based on our conversation, here is our proposal for your project — the scope, investment, payment schedule and timeline. If anything needs adjusting, just reply and we will update it.`,
    items: [
      { id: uid(), label: 'Design', detail: 'Wireframes and visual design for all pages, one round of revisions', price: 0 },
      { id: uid(), label: 'Development', detail: 'Responsive build, admin panel, contact forms and SEO basics', price: 0 },
      { id: uid(), label: 'Launch & handover', detail: 'Deployment, domain setup, training session', price: 0 },
    ],
    taxLabel: 'GST',
    taxPercent: 18,
    milestones: [
      { id: uid(), label: 'Advance to start', percent: 50 },
      { id: uid(), label: 'Design approved', percent: 25 },
      { id: uid(), label: 'Launch', percent: 25 },
    ],
    timeline: '3–4 weeks from advance payment',
    terms: 'You own all code, design and content once the final payment is made.\nIncludes one round of revisions per phase; extra changes are quoted separately.\nHosting and domain fees are paid directly by the client.\nPrices are valid until the date shown on this proposal.',
    validUntil: valid,
    currency: estimator.currency || '₹',
    status: 'draft',
    createdAt: new Date().toISOString(),
    ...cleanProposalInput(body),
  }
  const list = await getProposals()
  list.unshift(proposal)
  await saveProposals(list)
  return proposal
})

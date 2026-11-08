import { randomBytes } from 'node:crypto'

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined'
export interface LineItem { id: string, label: string, detail?: string, price: number }
export interface Milestone { id: string, label: string, percent: number }
export interface Proposal {
  id: string
  token: string
  leadId?: string
  clientName: string
  clientEmail: string
  clientCompany?: string
  title: string
  intro: string
  items: LineItem[]
  taxLabel: string
  taxPercent: number
  milestones: Milestone[]
  timeline: string
  terms: string
  validUntil: string
  currency: string
  status: ProposalStatus
  createdAt: string
  sentAt?: string
  viewedAt?: string
  respondedAt?: string
  signedName?: string
  clientComment?: string
}

const db = () => useStorage('db')
export const getProposals = async () => (await db().getItem<Proposal[]>('proposals')) || []
export const saveProposals = (list: Proposal[]) => db().setItem('proposals', list)
export const newToken = () => randomBytes(18).toString('base64url')

export function totals(p: Pick<Proposal, 'items' | 'taxPercent' | 'milestones'>) {
  const subtotal = p.items.reduce((s, i) => s + (Number(i.price) || 0), 0)
  const tax = Math.round(subtotal * (Number(p.taxPercent) || 0)) / 100
  const total = subtotal + tax
  const milestones = p.milestones.map(m => ({ ...m, amount: Math.round(total * (Number(m.percent) || 0)) / 100 }))
  return { subtotal, tax, total, milestones }
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const num = (v: unknown, min = 0, max = 1e10) => Math.min(max, Math.max(min, Number(v) || 0))
const rid = () => randomBytes(4).toString('hex')

/** Whitelists and clamps the editable fields of a proposal. */
export function cleanProposalInput(b: any): Partial<Proposal> {
  const out: Partial<Proposal> = {}
  const text: [keyof Proposal, number][] = [
    ['clientName', 120], ['clientEmail', 200], ['clientCompany', 120], ['title', 160],
    ['intro', 4000], ['timeline', 400], ['terms', 6000], ['taxLabel', 30], ['currency', 5],
  ]
  for (const [k, max] of text) if (k in b) (out as any)[k] = str(b[k], max)
  if ('validUntil' in b) out.validUntil = /^\d{4}-\d{2}-\d{2}$/.test(b.validUntil) ? b.validUntil : ''
  if ('taxPercent' in b) out.taxPercent = num(b.taxPercent, 0, 100)
  if ('items' in b && Array.isArray(b.items)) {
    out.items = b.items.slice(0, 50).map((i: any) => ({
      id: str(i.id, 20) || rid(), label: str(i.label, 160), detail: str(i.detail, 600), price: num(i.price),
    })).filter((i: LineItem) => i.label)
  }
  if ('milestones' in b && Array.isArray(b.milestones)) {
    out.milestones = b.milestones.slice(0, 12).map((m: any) => ({
      id: str(m.id, 20) || rid(), label: str(m.label, 120), percent: num(m.percent, 0, 100),
    })).filter((m: Milestone) => m.label)
  }
  if ('leadId' in b) out.leadId = str(b.leadId, 40)
  return out
}

/** What the client is allowed to see (no internal ids or lead links). */
export function publicProposal(p: Proposal, settings: Record<string, any>) {
  const { leadId, token, ...rest } = p
  return {
    ...rest,
    ...totals(p),
    expired: !!p.validUntil && p.validUntil < new Date().toISOString().slice(0, 10) && !['accepted', 'declined'].includes(p.status),
    brand: {
      name: settings.brandName, email: settings.email, phone: settings.phone, location: settings.location,
      accent: settings.accent, accent2: settings.accent2, whatsapp: settings.whatsapp,
    },
  }
}

export const LEAD_STATUSES = ['new', 'contacted', 'proposal', 'won', 'lost'] as const

/** Moves the linked lead along the pipeline. */
export async function setLeadStatus(leadId: string | undefined, status: (typeof LEAD_STATUSES)[number], value?: number) {
  if (!leadId) return
  const leads = await getCollection<any>('messages')
  const lead = leads.find(l => l.id === leadId)
  if (!lead) return
  lead.status = status
  if (value !== undefined) lead.value = value
  await saveCollection('messages', leads)
}

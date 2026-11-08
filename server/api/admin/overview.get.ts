export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [projects, services, testimonials, messages, { views, pages }] = await Promise.all([
    getCollection<any>('projects'),
    getCollection('services'),
    getCollection('testimonials'),
    getCollection<any>('messages'),
    getViews(),
  ])
  const days = [...Array(14)].map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10)
    return { day: d, count: views[d] || 0 }
  })
  const topPages = Object.entries(pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }))
  // ---- sales pipeline ----
  const today = istDate(new Date().toISOString())
  const status = (m: any) => m.status || 'new'
  const pipeline = Object.fromEntries(LEAD_STATUSES.map(s => [s, messages.filter(m => status(m) === s).length]))
  const sum = (list: any[]) => list.reduce((a, m) => a + (Number(m.value) || 0), 0)
  const followUps = messages
    .filter(m => m.followUp && m.followUp <= today && !['won', 'lost'].includes(status(m)))
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
    .slice(0, 6)
    .map(m => ({ id: m.id, name: m.name, followUp: m.followUp, overdue: m.followUp < today }))
  const proposals = await getProposals()
  const hasRedis = !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)
  return {
    counts: {
      projects: projects.length,
      services: services.length,
      testimonials: testimonials.length,
      messages: messages.length,
      unread: messages.filter(m => !m.read).length,
      totalViews: Object.values(views).reduce((a, b) => a + b, 0),
    },
    days,
    pipeline,
    wonValue: sum(messages.filter(m => status(m) === 'won')),
    openValue: sum(messages.filter(m => ['new', 'contacted', 'proposal'].includes(status(m)))),
    followUps,
    proposalsOpen: proposals.filter(p => ['sent', 'viewed'].includes(p.status)).length,
    currency: (await getEstimator()).currency,
    topPages,
    recentMessages: messages.slice(0, 5),
    database: hasRedis ? 'Upstash Redis' : import.meta.dev ? 'Local files (.data)' : 'In-memory (not persistent)',
    persistent: hasRedis || import.meta.dev,
  }
})

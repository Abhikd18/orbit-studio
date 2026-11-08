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
    topPages,
    recentMessages: messages.slice(0, 5),
    database: hasRedis ? 'Upstash Redis' : import.meta.dev ? 'Local files (.data)' : 'In-memory (not persistent)',
    persistent: hasRedis || import.meta.dev,
  }
})

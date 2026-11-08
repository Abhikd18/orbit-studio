export default defineEventHandler(async () => {
  const [settings, services, projects, testimonials] = await Promise.all([
    getSettings(),
    getCollection('services'),
    getCollection<any>('projects'),
    getCollection<any>('testimonials'),
  ])
  return {
    settings,
    services,
    projects: projects.filter(p => p.published),
    testimonials: testimonials.filter(t => t.published),
  }
})

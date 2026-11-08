export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const projects = (await getCollection<any>('projects')).filter(p => p.published)
  const index = projects.findIndex(p => p.slug === slug)
  if (index === -1) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  return {
    project: projects[index],
    next: projects.length > 1 ? projects[(index + 1) % projects.length] : null,
  }
})

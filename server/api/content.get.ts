export default defineEventHandler(async () => {
  const [settings, estimator, services, projects, testimonials, faqs, posts] = await Promise.all([
    getSettings(),
    getEstimator(),
    getCollection('services'),
    getCollection<any>('projects'),
    getCollection<any>('testimonials'),
    getCollection<any>('faqs'),
    getCollection<any>('posts'),
  ])
  return {
    settings,
    estimator,
    services,
    projects: projects.filter(p => p.published),
    testimonials: testimonials.filter(t => t.published),
    faqs: faqs.filter(f => f.published),
    // list view only needs the summary, not the full body
    posts: livePosts(posts).map(({ body, ...rest }) => rest),
  }
})

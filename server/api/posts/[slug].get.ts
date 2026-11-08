export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const posts = (await getCollection<any>('posts'))
    .filter(p => p.published)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  const post = posts.find(p => p.slug === slug)
  if (!post) throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  return { post, more: posts.filter(p => p.slug !== slug).slice(0, 2).map(({ body, ...r }) => r) }
})

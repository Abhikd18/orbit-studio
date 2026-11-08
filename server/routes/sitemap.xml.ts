// Sitemap for Google, built from live data: /sitemap.xml
export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const [projects, posts] = await Promise.all([getCollection<any>('projects'), getCollection<any>('posts')])
  const urls = [
    '/', '/projects', '/blog',
    ...projects.filter(p => p.published).map(p => `/projects/${p.slug}`),
    ...posts.filter(p => p.published).map(p => `/blog/${p.slug}`),
  ]
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${origin}${u}</loc></url>`).join('\n')}
</urlset>`
})

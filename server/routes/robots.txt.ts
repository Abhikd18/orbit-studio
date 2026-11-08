export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *
Disallow: /admin
Disallow: /api/admin
Sitemap: ${getRequestURL(event).origin}/sitemap.xml
`
})

const ALLOWED = ['brandName', 'heroBadge', 'heroTitle', 'heroHighlight', 'heroSubtitle', 'ctaText', 'email', 'phone', 'location', 'accent', 'accent2']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Record<string, any>>(event)
  const data = Object.fromEntries(
    Object.entries(body || {}).filter(([k, v]) => ALLOWED.includes(k) && typeof v === 'string'),
  )
  for (const key of ['accent', 'accent2']) {
    if (key in data && !/^#[0-9a-f]{3,8}$/i.test(data[key]))
      throw createError({ statusCode: 400, statusMessage: `${key} must be a hex colour like #7c5cff` })
  }
  return saveSettings(data)
})

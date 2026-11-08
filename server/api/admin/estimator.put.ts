const num = (v: any, min = 0, max = 1e9) => Math.min(max, Math.max(min, Number(v) || 0))
const items = (list: any) =>
  (Array.isArray(list) ? list : [])
    .slice(0, 30)
    .map((x: any) => ({
      id: String(x.id || Math.random().toString(36).slice(2, 8)).slice(0, 40),
      label: String(x.label || '').trim().slice(0, 80),
      price: num(x.price),
    }))
    .filter(x => x.label)

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = (await readBody<any>(event)) || {}
  return saveEstimator({
    currency: String(b.currency || '₹').slice(0, 5),
    rushMultiplier: num(b.rushMultiplier, 1, 3),
    spread: num(b.spread, 0, 0.5),
    pagePrice: num(b.pagePrice),
    types: items(b.types),
    features: items(b.features),
  })
})

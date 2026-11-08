export const formatDate = (d: string) => {
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatMoney = (n: number, currency = '₹') =>
  currency + (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export const todayIST = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10)
export const addDays = (days: number) => new Date(Date.now() + 5.5 * 3600e3 + days * 864e5).toISOString().slice(0, 10)

/** Rough reading time in minutes. */
export const readingTime = (text = '') => Math.max(1, Math.round(text.split(/\s+/).length / 200))

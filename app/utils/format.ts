export const formatDate = (d: string) => {
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? d : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Rough reading time in minutes. */
export const readingTime = (text = '') => Math.max(1, Math.round(text.split(/\s+/).length / 200))

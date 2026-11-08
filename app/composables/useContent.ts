export interface Settings {
  brandName: string
  heroBadge: string
  heroTitle: string
  heroHighlight: string
  heroSubtitle: string
  ctaText: string
  email: string
  phone: string
  location: string
  accent: string
  accent2: string
  whatsapp: string
  linkedin: string
  aboutTitle: string
  aboutText: string
  founderName: string
  founderRole: string
  founderPhoto?: string
}
export interface PriceItem { id: string, label: string, price: number }
export interface EstimatorConfig {
  currency: string
  rushMultiplier: number
  spread: number
  pagePrice: number
  types: PriceItem[]
  features: PriceItem[]
}
export interface Faq { id: string, question: string, answer: string, published: boolean }
export interface Post { id: string, slug: string, title: string, excerpt: string, body?: string, cover: string, image?: string, date: string, published: boolean }
export interface Project {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  body: string
  tags: string[]
  gradient: string
  image?: string
  link?: string
  featured: boolean
  published: boolean
}
export interface Service { id: string, icon: string, title: string, text: string }
export interface Testimonial { id: string, name: string, role: string, quote: string, published: boolean }

/** Base URL for API calls: empty on the website, the Vercel URL inside the mobile app. */
export const useApiBase = () => useRuntimeConfig().public.apiBase as string

/** All public site content, fetched once and shared between pages. */
export function useContent() {
  return useFetch<{
    settings: Settings
    estimator: EstimatorConfig
    services: Service[]
    projects: Project[]
    testimonials: Testimonial[]
    faqs: Faq[]
    posts: Post[]
  }>(
    '/api/content',
    { key: 'content', baseURL: useApiBase() },
  )
}

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
}
export interface Project {
  id: string
  slug: string
  title: string
  category: string
  summary: string
  body: string
  tags: string[]
  gradient: string
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
  return useFetch<{ settings: Settings, services: Service[], projects: Project[], testimonials: Testimonial[] }>(
    '/api/content',
    { key: 'content', baseURL: useApiBase() },
  )
}

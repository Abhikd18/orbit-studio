// https://nuxt.com/docs/api/configuration/nuxt-config
const isMobile = !!process.env.NUXT_MOBILE

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  // When building the mobile app (Capacitor) we ship a static SPA that
  // talks to the live API on Vercel. The website itself is fully SSR.
  ssr: !isMobile,

  runtimeConfig: {
    // Read at RUNTIME (set them in Vercel → Settings → Environment Variables).
    adminPassword: '', // NUXT_ADMIN_PASSWORD (or ADMIN_PASSWORD, see server/utils/auth.ts)
    sessionSecret: '', // NUXT_SESSION_SECRET
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Orbit Studio — Web, Mobile & Cloud',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Orbit Studio builds fast, modern websites, mobile apps and admin platforms.' },
        { name: 'theme-color', content: '#05060f' },
        { property: 'og:title', content: 'Orbit Studio — Web, Mobile & Cloud' },
        { property: 'og:description', content: 'Websites, mobile apps and dashboards from one codebase.' },
        { property: 'og:image', content: '/og.svg' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icons/icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap' },
      ],
    },
  },

  nitro: {
    // Local dev persists data to ./.data so you can play with the admin.
    devStorage: {
      db: { driver: 'fs', base: './.data/db' },
    },
  },
})

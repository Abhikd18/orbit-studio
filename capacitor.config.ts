import type { CapacitorConfig } from '@capacitor/cli'

// Mobile app (Android / iOS) built from the SAME Nuxt codebase.
// 1) Set NUXT_PUBLIC_API_BASE to your Vercel URL in .env
// 2) npm run mobile:build
// 3) npx cap add android   (first time only)   -> npm run mobile:android
const config: CapacitorConfig = {
  appId: 'studio.orbit.app',
  appName: 'Orbit Studio',
  webDir: '.output/public',
  backgroundColor: '#05060f',
}

export default config

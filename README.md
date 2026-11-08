# Orbit Studio — Nuxt website + admin + mobile app

One Nuxt 4 codebase that delivers:

| What | Where | How |
|---|---|---|
| **Dynamic website** (SSR, SEO) | `/`, `/projects`, `/projects/:slug` | Content comes from the database through `server/api/*` |
| **Admin dashboard / CMS** | `/admin` | Password login, analytics, lead inbox, CRUD for projects / services / testimonials, live brand colours |
| **Installable PWA** | any phone browser → "Add to Home Screen" | `public/manifest.webmanifest`, `public/sw.js` |
| **Native Android / iOS app** | `capacitor.config.ts` | Same Vue code, static build that calls the live API |
| **Hosting + CI/CD** | Vercel (free Hobby plan) | Every `git push` deploys automatically |
| **Database** | Upstash Redis (free tier) | Picked automatically from env vars, see below |

Everything here is free.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Admin: http://localhost:3000/admin. The default password is `orbit-admin`. Change it with `ADMIN_PASSWORD` in `.env`.
Locally, data is saved in `.data/db` (JSON files).

## Deploy to Vercel

1. Push this repo to GitHub.
2. On vercel.com, choose **Add New → Project**, import the repo, and click **Deploy**. Nuxt is detected automatically.
3. Under **Settings → Environment Variables**, add:
   - `NUXT_ADMIN_PASSWORD`: your admin password
   - `NUXT_SESSION_SECRET`: a random string of 32 or more characters
4. **Database (makes admin edits permanent):** go to **Storage → Create Database → Upstash (Redis) → Free**, then connect it to the project.
   Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`, and the app uses them automatically.
5. Redeploy. The admin Overview page shows which database is active.

> Without step 4 the site still works, but it uses an in-memory store, so admin edits and messages reset when the serverless function restarts.

## Build the mobile app

```bash
# .env → NUXT_PUBLIC_API_BASE=https://your-site.vercel.app
npm run mobile:build      # static SPA in .output/public
npx cap add android       # first time only (npx cap add ios on macOS)
npm run mobile:sync
npm run mobile:android    # opens Android Studio → Run / Build APK
```

## Project structure

```
app/
  pages/             index, projects/, admin/
  components/        UI (ProjectCard, PhoneMockup, AdminCollection …)
  layouts/           default (site) and admin
  middleware/admin   protects /admin
server/
  api/               public API + /api/admin/* (session-protected)
  utils/db.ts        storage layer (seed data in utils/seed.ts)
  plugins/storage.ts picks Upstash Redis or memory at runtime
public/              PWA manifest, service worker, icons
capacitor.config.ts  native app config
```

## Before sending to clients

The starter projects describe what this codebase does. Replace them with your real client work in **Admin → Projects**, and add real quotes in **Admin → Testimonials**.
Then update the brand name, email and phone in **Admin → Settings**.

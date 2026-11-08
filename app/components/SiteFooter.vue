<script setup lang="ts">
import type { Settings } from '~/composables/useContent'
defineProps<{ settings: Settings }>()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="top">
        <div>
          <div class="brand">{{ settings.brandName }}</div>
          <p class="muted">Websites, mobile apps & dashboards — one modern codebase.</p>
        </div>
        <div class="cols">
          <div>
            <h4>Explore</h4>
            <NuxtLink to="/#services">Services</NuxtLink>
            <NuxtLink to="/projects">Work</NuxtLink>
            <NuxtLink to="/#mobile">Mobile app</NuxtLink>
          </div>
          <div>
            <h4>Contact</h4>
            <a :href="`mailto:${settings.email}`">{{ settings.email }}</a>
            <a :href="`tel:${settings.phone.replace(/\s/g, '')}`">{{ settings.phone }}</a>
            <span>{{ settings.location }}</span>
          </div>
        </div>
      </div>
      <div class="bottom">
        <span>© {{ year }} {{ settings.brandName }}. All rights reserved.</span>
        <span class="status"><i /> All systems operational</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer { border-top: 1px solid var(--border); padding: 64px 0 28px; background: linear-gradient(180deg, transparent, rgba(124,92,255,.05)); }
.top { display: flex; justify-content: space-between; gap: 40px; flex-wrap: wrap; }
.brand { font-family: var(--font-head); font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }
.muted { color: var(--muted); max-width: 340px; }
.cols { display: flex; gap: 64px; flex-wrap: wrap; }
.cols div { display: grid; gap: 10px; align-content: start; color: var(--muted); font-size: .92rem; }
.cols a:hover { color: var(--text); }
h4 { font-size: .8rem; text-transform: uppercase; letter-spacing: .14em; color: var(--text); margin-bottom: 6px; }
.bottom { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; color: var(--faint); font-size: .85rem; }
.status { display: inline-flex; align-items: center; gap: 8px; }
.status i { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 10px var(--success); animation: pulse 2s infinite; }
@keyframes pulse { 50% { opacity: .4; } }
</style>

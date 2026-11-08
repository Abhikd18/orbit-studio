<script setup lang="ts">
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => (open.value = false))
const nav = [
  { to: '/admin', label: 'Overview', icon: 'grid' },
  { to: '/admin/projects', label: 'Projects', icon: 'folder' },
  { to: '/admin/services', label: 'Services', icon: 'spark' },
  { to: '/admin/testimonials', label: 'Testimonials', icon: 'star' },
  { to: '/admin/messages', label: 'Messages', icon: 'inbox' },
  { to: '/admin/settings', label: 'Settings', icon: 'cog' },
]
async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
useHead({ title: 'Admin', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <div class="admin">
    <aside class="side" :class="{ open }">
      <NuxtLink to="/admin" class="logo"><span class="mark" /> Orbit Admin</NuxtLink>
      <nav>
        <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" :class="{ active: n.to === '/admin' ? route.path === '/admin' : route.path.startsWith(n.to) }">
          <Icon :name="n.icon" :size="18" /> {{ n.label }}
        </NuxtLink>
      </nav>
      <div class="side-foot">
        <NuxtLink to="/" target="_blank" class="link"><Icon name="external" :size="16" /> View website</NuxtLink>
        <button class="link" @click="logout"><Icon name="logout" :size="16" /> Log out</button>
      </div>
    </aside>
    <div v-if="open" class="scrim" @click="open = false" />
    <div class="main">
      <header class="top">
        <button class="burger" aria-label="Menu" @click="open = !open"><Icon name="menu" /></button>
        <span class="crumb">{{ nav.find(n => n.to === '/admin' ? route.path === '/admin' : route.path.startsWith(n.to))?.label }}</span>
      </header>
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin { min-height: 100vh; display: grid; grid-template-columns: 250px 1fr; background: radial-gradient(circle at 100% 0%, rgba(124,92,255,.12), transparent 40%), var(--bg); }
.side { position: sticky; top: 0; height: 100vh; border-right: 1px solid var(--border); padding: 22px 16px; display: flex; flex-direction: column; gap: 26px; background: rgba(10,12,27,.8); backdrop-filter: blur(16px); }
.logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-weight: 700; padding: 0 10px; }
.mark { width: 22px; height: 22px; border-radius: 50%; background: var(--grad); box-shadow: 0 0 18px var(--accent); }
nav { display: grid; gap: 4px; }
nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; color: var(--muted); font-size: .92rem; transition: background .2s, color .2s; }
nav a:hover { background: var(--surface); color: var(--text); }
nav a.active { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--text); box-shadow: inset 2px 0 0 var(--accent); }
.side-foot { margin-top: auto; display: grid; gap: 4px; }
.link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; background: none; border: 0; cursor: pointer; color: var(--muted); font-size: .88rem; text-align: left; }
.link:hover { color: var(--text); background: var(--surface); }
.main { min-width: 0; }
.top { height: 64px; display: flex; align-items: center; gap: 14px; padding: 0 28px; border-bottom: 1px solid var(--border); }
.crumb { font-family: var(--font-head); font-weight: 600; }
.burger { display: none; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; width: 40px; height: 40px; place-items: center; cursor: pointer; }
.content { padding: 28px; max-width: 1200px; }
.scrim { display: none; }
@media (max-width: 900px) {
  .admin { grid-template-columns: 1fr; }
  .side { position: fixed; z-index: 60; width: 260px; left: 0; transform: translateX(-100%); transition: transform .3s; }
  .side.open { transform: none; }
  .scrim { display: block; position: fixed; inset: 0; z-index: 55; background: rgba(0,0,0,.5); }
  .burger { display: grid; }
  .top, .content { padding-left: 16px; padding-right: 16px; }
}
</style>

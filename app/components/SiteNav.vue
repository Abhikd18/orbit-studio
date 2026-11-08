<script setup lang="ts">
defineProps<{ brand: string, cta: string }>()
const open = ref(false)
const scrolled = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))
onMounted(() => {
  const onScroll = () => (scrolled.value = window.scrollY > 20)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
})
const links = [
  { to: '/#services', label: 'Services' },
  { to: '/projects', label: 'Work' },
  { to: '/#mobile', label: 'Mobile' },
  { to: '/#stack', label: 'Stack' },
  { to: '/#contact', label: 'Contact' },
]
</script>

<template>
  <header class="nav" :class="{ scrolled, open }">
    <div class="container inner">
      <NuxtLink to="/" class="logo">
        <span class="mark"><span /></span>
        {{ brand }}
      </NuxtLink>
      <nav class="links">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
      </nav>
      <div class="right">
        <NuxtLink to="/#contact" class="btn btn-primary btn-sm cta">{{ cta }}</NuxtLink>
        <button class="burger" :aria-label="open ? 'Close menu' : 'Open menu'" @click="open = !open">
          <Icon :name="open ? 'close' : 'menu'" />
        </button>
      </div>
    </div>
    <Transition name="drop">
      <nav v-if="open" class="mobile-menu container">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
        <NuxtLink to="/#contact" class="btn btn-primary">{{ cta }}</NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 50; transition: background .3s, border-color .3s, backdrop-filter .3s; border-bottom: 1px solid transparent; }
.nav.scrolled, .nav.open { background: rgba(5, 6, 15, .72); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-color: var(--border); }
.inner { display: flex; align-items: center; justify-content: space-between; height: 72px; gap: 20px; }
.logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-weight: 700; font-size: 1.15rem; }
.mark { width: 28px; height: 28px; border-radius: 50%; background: var(--grad); display: grid; place-items: center; box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 70%, transparent); }
.mark span { width: 10px; height: 10px; border-radius: 50%; background: var(--bg); }
.links { display: flex; gap: 30px; font-size: .92rem; color: var(--muted); }
.links a { transition: color .2s; }
.links a:hover { color: var(--text); }
.right { display: flex; align-items: center; gap: 10px; }
.burger { display: none; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; width: 42px; height: 42px; place-items: center; cursor: pointer; }
.mobile-menu { display: grid; gap: 4px; padding-bottom: 20px; }
.mobile-menu a:not(.btn) { padding: 14px 4px; border-bottom: 1px solid var(--border); font-size: 1.05rem; }
.mobile-menu .btn { margin-top: 14px; }
.drop-enter-active, .drop-leave-active { transition: opacity .2s, transform .2s; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }
@media (max-width: 860px) {
  .links, .cta { display: none; }
  .burger { display: grid; }
}
</style>

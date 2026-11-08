<script setup lang="ts">
import type { Project } from '~/composables/useContent'
const route = useRoute()
const { data, error } = await useFetch<{ project: Project, next: Project | null }>(
  () => `/api/projects/${route.params.slug}`,
  { baseURL: useApiBase() },
)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
const p = computed(() => data.value!.project)
const paragraphs = computed(() => (p.value.body || '').split(/\n\s*\n/).filter(Boolean))
useSeoMeta({ title: () => p.value.title, description: () => p.value.summary, ogTitle: () => p.value.title, ogDescription: () => p.value.summary, ogImage: () => p.value.image })

// gallery lightbox
const gallery = computed(() => p.value.gallery || [])
const lb = ref<number | null>(null)
const step = (d: number) => { if (lb.value !== null) lb.value = (lb.value + d + gallery.value.length) % gallery.value.length }
function onKey(e: KeyboardEvent) {
  if (lb.value === null) return
  if (e.key === 'Escape') lb.value = null
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <article v-if="data" class="page">
    <div class="container">
      <NuxtLink to="/projects" class="back"><Icon name="arrowLeft" :size="18" /> All work</NuxtLink>
      <header v-reveal class="head">
        <span class="eyebrow">{{ p.category }}</span>
        <h1>{{ p.title }}</h1>
        <p class="summary">{{ p.summary }}</p>
        <div class="tags"><span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span></div>
      </header>
      <div v-if="p.image" v-reveal="100" class="hero-shot">
        <img :src="p.image" :alt="`Screenshot of ${p.title}`">
      </div>
      <div v-else v-reveal="100" class="hero-cover" :style="{ background: p.gradient }">
        <div class="grid" />
        <div class="orb" />
        <div class="orb o2" />
      </div>
      <div class="content">
        <div class="body">
          <p v-for="(para, i) in paragraphs" :key="i" v-reveal="i * 60">{{ para }}</p>
        </div>
        <aside v-reveal class="meta card">
          <div><small>Category</small><b>{{ p.category }}</b></div>
          <div><small>Stack</small><b>{{ p.tags.join(', ') }}</b></div>
          <a v-if="p.link" :href="p.link" target="_blank" rel="noopener" class="btn btn-primary">Visit live <Icon name="external" :size="16" /></a>
          <NuxtLink to="/#contact" class="btn">Start a similar project</NuxtLink>
        </aside>
      </div>
      <section v-if="gallery.length" class="gallery">
        <h2>Screens</h2>
        <div class="gal">
          <button v-for="(url, i) in gallery" :key="url" v-reveal="(i % 2) * 80" class="shot" :aria-label="`Open screenshot ${i + 1}`" @click="lb = i">
            <img :src="url" :alt="`${p.title} screenshot ${i + 1}`" loading="lazy">
          </button>
        </div>
      </section>
      <Teleport to="body">
        <Transition name="lb">
          <div v-if="lb !== null" class="lightbox" role="dialog" aria-modal="true" :aria-label="`Screenshot ${lb + 1} of ${gallery.length}`" @click.self="lb = null">
            <img :src="gallery[lb]" :alt="`${p.title} screenshot ${lb + 1}`">
            <button class="lb-btn lb-close" aria-label="Close" @click="lb = null"><Icon name="close" /></button>
            <template v-if="gallery.length > 1">
              <button class="lb-btn lb-prev" aria-label="Previous" @click="step(-1)"><Icon name="arrowLeft" /></button>
              <button class="lb-btn lb-next" aria-label="Next" @click="step(1)"><Icon name="arrow" /></button>
            </template>
            <span class="count">{{ lb + 1 }} / {{ gallery.length }}</span>
          </div>
        </Transition>
      </Teleport>
      <NuxtLink v-if="data.next" :to="`/projects/${data.next.slug}`" class="next card card-glow">
        <small>Next project</small>
        <b>{{ data.next.title }}</b>
        <Icon name="arrow" :size="28" />
      </NuxtLink>
    </div>
  </article>
</template>

<style scoped>
.page { padding: 130px 0 100px; }
.back { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: .9rem; margin-bottom: 40px; }
.back:hover { color: var(--text); }
.head { max-width: 820px; }
h1 { font-size: clamp(2.4rem, 6vw, 4.6rem); margin-top: 14px; }
.summary { color: var(--muted); font-size: 1.2rem; margin-top: 18px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.hero-cover { position: relative; margin-top: 50px; aspect-ratio: 21 / 9; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
.gallery { margin-top: 80px; }
.gallery h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin-bottom: 24px; }
.gal { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.shot { padding: 0; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; cursor: zoom-in; background: var(--surface); transition: transform .3s, border-color .3s; }
.shot:hover, .shot:focus-visible { transform: translateY(-4px); border-color: var(--border-strong); outline: none; }
.shot img { display: block; width: 100%; height: auto; }
.lightbox { position: fixed; inset: 0; z-index: 200; background: rgba(3,4,10,.92); backdrop-filter: blur(8px); display: grid; place-items: center; padding: 60px 70px; }
.lightbox img { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 40px 120px rgba(0,0,0,.6); }
.lb-btn { position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--border-strong); background: rgba(255,255,255,.08); color: #fff; display: grid; place-items: center; cursor: pointer; }
.lb-btn:hover { background: rgba(255,255,255,.18); }
.lb-close { top: 16px; right: 16px; } .lb-prev { left: 14px; top: 50%; transform: translateY(-50%); } .lb-next { right: 14px; top: 50%; transform: translateY(-50%); }
.count { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); color: var(--muted); font-size: .85rem; }
.lb-enter-active, .lb-leave-active { transition: opacity .2s; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
@media (max-width: 700px) { .gal { grid-template-columns: 1fr; } .lightbox { padding: 60px 10px; } .lb-prev, .lb-next { top: auto; bottom: 10px; transform: none; } }
.hero-shot { margin-top: 50px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); box-shadow: 0 40px 100px -30px rgba(0,0,0,.7); }
.hero-shot img { display: block; width: 100%; height: auto; }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle at 70% 40%, #000, transparent 70%); -webkit-mask-image: radial-gradient(circle at 70% 40%, #000, transparent 70%); }
.orb { position: absolute; width: 34%; aspect-ratio: 1; right: 10%; top: 10%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, rgba(255,255,255,.2) 40%, transparent 70%); animation: drift 10s ease-in-out infinite; }
.o2 { width: 16%; right: auto; left: 12%; top: 55%; opacity: .7; animation-duration: 14s; }
@keyframes drift { 50% { transform: translate(-20px, 20px); } }
.content { display: grid; grid-template-columns: 1fr 320px; gap: 50px; margin-top: 60px; align-items: start; }
.body { display: grid; gap: 22px; font-size: 1.12rem; color: #cfd3ea; }
.meta { padding: 24px; display: grid; gap: 18px; position: sticky; top: 100px; }
.meta small { display: block; color: var(--faint); font-size: .78rem; text-transform: uppercase; letter-spacing: .12em; }
.next { margin-top: 80px; padding: 34px; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 6px 20px; }
.next small { color: var(--muted); grid-column: 1; }
.next b { font-family: var(--font-head); font-size: clamp(1.4rem, 3vw, 2.2rem); grid-column: 1; }
.next :deep(svg) { grid-column: 2; grid-row: 1 / 3; transition: transform .3s; }
.next:hover :deep(svg) { transform: translateX(6px); }
@media (max-width: 860px) { .content { grid-template-columns: 1fr; } .meta { position: static; } .hero-cover { aspect-ratio: 16 / 10; } }
</style>

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
useSeoMeta({ title: () => p.value.title, description: () => p.value.summary, ogTitle: () => p.value.title, ogDescription: () => p.value.summary })
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
      <div v-if="p.image" v-reveal="100" class="hero-shot" :style="{ background: p.gradient }">
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
.hero-shot { margin-top: 50px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); padding: clamp(10px, 3vw, 36px); }
.hero-shot img { width: 100%; height: auto; border-radius: 12px; box-shadow: 0 30px 80px -20px rgba(0,0,0,.6); }
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

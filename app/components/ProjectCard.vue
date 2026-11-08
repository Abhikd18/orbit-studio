<script setup lang="ts">
import type { Project } from '~/composables/useContent'
defineProps<{ project: Project }>()
</script>

<template>
  <NuxtLink :to="`/projects/${project.slug}`" class="pcard card card-glow">
    <div class="cover" :style="{ background: project.gradient }">
      <img v-if="project.image" :src="project.image" :alt="`Screenshot of ${project.title}`" class="shot" loading="lazy">
      <div v-else class="cover-grid" />
      <span class="cat">{{ project.category }}</span>
      <div v-if="!project.image" class="orb" />
    </div>
    <div class="body">
      <h3>{{ project.title }}</h3>
      <p>{{ project.summary }}</p>
      <div class="foot">
        <div class="tags">
          <span v-for="t in project.tags.slice(0, 3)" :key="t" class="tag">{{ t }}</span>
        </div>
        <span class="go"><Icon name="arrow" :size="18" /></span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.pcard { display: flex; flex-direction: column; transition: transform .35s cubic-bezier(.2,.7,.2,1), border-color .35s; }
.pcard:hover { transform: translateY(-6px); border-color: var(--border-strong); }
.cover { position: relative; aspect-ratio: 16 / 9; border-radius: calc(var(--radius) - 6px); margin: 8px; overflow: hidden; }
.cover-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px); background-size: 28px 28px; mask-image: radial-gradient(circle at 70% 30%, #000, transparent 70%); -webkit-mask-image: radial-gradient(circle at 70% 30%, #000, transparent 70%); }
.shot { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform .6s cubic-bezier(.2,.7,.2,1); }
.pcard:hover .shot { transform: scale(1.04); }
.orb { position: absolute; width: 46%; aspect-ratio: 1; right: 8%; bottom: -18%; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,.15) 40%, transparent 70%); transition: transform .6s cubic-bezier(.2,.7,.2,1); }
.pcard:hover .orb { transform: translate(-10%, -12%) scale(1.08); }
.cat { position: absolute; top: 14px; left: 14px; padding: 5px 11px; border-radius: 999px; background: rgba(5,6,15,.55); backdrop-filter: blur(8px); font-size: .75rem; font-weight: 600; }
.body { padding: 14px 22px 22px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
h3 { font-size: 1.3rem; }
p { color: var(--muted); font-size: .95rem; flex: 1; }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 6px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; }
.go { width: 38px; height: 38px; flex: none; border-radius: 50%; display: grid; place-items: center; border: 1px solid var(--border-strong); transition: background .3s, transform .3s; }
.pcard:hover .go { background: var(--grad); border-color: transparent; transform: rotate(-45deg); }
</style>

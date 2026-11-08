<script setup lang="ts">
import type { Post } from '~/composables/useContent'
defineProps<{ post: Post }>()
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="post card card-glow">
    <div class="cover" :style="{ background: post.cover }">
      <img v-if="post.image" :src="post.image" alt="" loading="lazy" class="img">
      <span v-else class="lines" />
    </div>
    <div class="body">
      <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      <h3>{{ post.title }}</h3>
      <p>{{ post.excerpt }}</p>
      <span class="more">Read article <Icon name="arrow" :size="16" /></span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.post { display: flex; flex-direction: column; transition: transform .35s cubic-bezier(.2,.7,.2,1), border-color .35s; }
.post:hover { transform: translateY(-5px); border-color: var(--border-strong); }
.cover { position: relative; height: 140px; margin: 8px; border-radius: calc(var(--radius) - 6px); overflow: hidden; }
.img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s; }
.post:hover .img { transform: scale(1.04); }
.lines { position: absolute; inset: 0; background: repeating-linear-gradient(115deg, rgba(255,255,255,.14) 0 1px, transparent 1px 18px); transition: transform .8s; }
.post:hover .lines { transform: translateX(18px); }
.body { padding: 12px 22px 22px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
time { font-size: .8rem; color: var(--faint); }
h3 { font-size: 1.2rem; line-height: 1.25; }
p { color: var(--muted); font-size: .93rem; flex: 1; }
.more { display: inline-flex; align-items: center; gap: 6px; font-size: .88rem; color: var(--accent-2); margin-top: 6px; }
</style>

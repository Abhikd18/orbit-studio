<script setup lang="ts">
import type { Post } from '~/composables/useContent'
const route = useRoute()
const { data, error } = await useFetch<{ post: Post, more: Post[] }>(
  () => `/api/posts/${route.params.slug}`,
  { baseURL: useApiBase() },
)
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
const post = computed(() => data.value!.post)
const paragraphs = computed(() => (post.value.body || '').split(/\n\s*\n/).filter(Boolean))
const { data: content } = await useContent()

useSeoMeta({
  title: () => post.value.title,
  description: () => post.value.excerpt,
  ogTitle: () => post.value.title,
  ogDescription: () => post.value.excerpt,
  ogType: 'article',
})
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.value.title,
      'description': post.value.excerpt,
      'datePublished': post.value.date,
      'author': { '@type': 'Organization', 'name': content.value?.settings.brandName },
    }).replace(/</g, '\\u003c'),
  }],
}))
</script>

<template>
  <article v-if="data" class="page">
    <div class="container narrow">
      <NuxtLink to="/blog" class="back"><Icon name="arrowLeft" :size="18" /> All articles</NuxtLink>
      <header v-reveal>
        <div class="meta">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <span>·</span>
          <span>{{ readingTime(post.body) }} min read</span>
        </div>
        <h1>{{ post.title }}</h1>
        <p class="excerpt">{{ post.excerpt }}</p>
      </header>
      <img v-if="post.image" v-reveal="80" :src="post.image" alt="" class="cover-img">
      <div v-else v-reveal="80" class="cover" :style="{ background: post.cover }" />
      <div class="body">
        <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
      </div>
      <div class="cta card">
        <div>
          <b>Planning a project?</b>
          <p>Get an instant price estimate or talk to us directly.</p>
        </div>
        <div class="cta-btns">
          <NuxtLink to="/#estimate" class="btn">Estimate cost</NuxtLink>
          <NuxtLink to="/#contact" class="btn btn-primary">Contact us</NuxtLink>
        </div>
      </div>
    </div>
    <div v-if="data.more.length" class="container more">
      <h2>Keep reading</h2>
      <div class="grid">
        <PostCard v-for="p in data.more" :key="p.id" :post="p" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.page { padding: 130px 0 100px; }
.narrow { max-width: 780px; }
.back { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); font-size: .9rem; margin-bottom: 36px; }
.back:hover { color: var(--text); }
.meta { display: flex; gap: 8px; color: var(--faint); font-size: .88rem; }
h1 { font-size: clamp(2.1rem, 5vw, 3.4rem); margin-top: 14px; }
.excerpt { color: var(--muted); font-size: 1.2rem; margin-top: 16px; }
.cover { height: 220px; border-radius: var(--radius); margin: 40px 0; border: 1px solid var(--border); background-size: cover; }
.cover-img { width: 100%; height: auto; max-height: 440px; object-fit: cover; border-radius: var(--radius); margin: 40px 0; border: 1px solid var(--border); }
.body { display: grid; gap: 22px; font-size: 1.12rem; line-height: 1.8; color: #d4d8ee; }
.cta { margin-top: 56px; padding: 24px; display: flex; justify-content: space-between; align-items: center; gap: 18px; flex-wrap: wrap; }
.cta p { color: var(--muted); font-size: .92rem; }
.cta-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.more { margin-top: 90px; }
.more h2 { font-size: 1.8rem; margin-bottom: 24px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .cover { height: 160px; } }
</style>

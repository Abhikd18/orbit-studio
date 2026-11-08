<script setup lang="ts">
const { data } = await useContent()
useSeoMeta({
  title: () => `Blog — ${data.value?.settings.brandName}`,
  description: 'Practical articles about websites, mobile apps and growing your business online.',
})
</script>

<template>
  <section class="section page">
    <div class="container">
      <div v-reveal class="section-head">
        <span class="eyebrow">Insights</span>
        <h1>The <span class="grad-text">blog</span></h1>
        <p>Practical guides on websites, apps and growing your business online.</p>
      </div>
      <div class="grid">
        <PostCard v-for="(p, i) in data?.posts" :key="p.id" v-reveal="i * 60" :post="p" />
      </div>
      <p v-if="!data?.posts.length" class="empty">No articles yet.</p>
    </div>
  </section>
</template>

<style scoped>
.page { padding-top: 150px; }
h1 { font-size: clamp(2.6rem, 6vw, 4.4rem); margin-top: 14px; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.empty { color: var(--muted); }
@media (max-width: 960px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .page { padding-top: 120px; } }
</style>

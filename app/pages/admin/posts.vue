<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const today = new Date().toISOString().slice(0, 10)
</script>

<template>
  <AdminCollection
    collection="posts"
    title="Blog posts"
    description="Articles at /blog. Fresh posts help your Google ranking."
    title-key="title"
    subtitle-key="excerpt"
    view-base="/blog"
    :defaults="{ title: '', slug: '', excerpt: '', body: '', cover: 'linear-gradient(135deg,#7c5cff,#22d3ee)', date: today, published: true }"
    :fields="[
      { key: 'title', label: 'Title', required: true },
      { key: 'slug', label: 'URL slug (optional)', placeholder: 'my-article' },
      { key: 'excerpt', label: 'Short summary (shown on cards & Google)', required: true },
      { key: 'body', label: 'Article (blank line = new paragraph)', type: 'textarea', required: true },
      { key: 'cover', label: 'Cover colour', type: 'gradient' },
      { key: 'date', label: 'Publish date', type: 'date' },
      { key: 'published', label: 'Published', type: 'toggle' },
    ]"
  />
</template>

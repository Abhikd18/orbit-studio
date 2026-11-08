<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <AdminCollection
    collection="posts"
    title="Blog posts"
    description="Articles at /blog. Set a future publish time to schedule a post — it goes live automatically."
    title-key="title"
    subtitle-key="excerpt"
    view-base="/blog"
    :defaults="{ title: '', slug: '', excerpt: '', body: '', cover: 'linear-gradient(135deg,#7c5cff,#22d3ee)', publishAt: '', published: true }"
    :fields="[
      { key: 'title', label: 'Title', required: true },
      { key: 'slug', label: 'URL slug (optional)', placeholder: 'my-article' },
      { key: 'excerpt', label: 'Short summary (shown on cards & Google)', required: true },
      { key: 'body', label: 'Article (blank line = new paragraph)', type: 'textarea', required: true },
      { key: 'cover', label: 'Cover colour', type: 'gradient' },
      { key: 'publishAt', label: 'Publish time (empty = now, future = scheduled)', type: 'datetime' },
      { key: 'published', label: 'Published', type: 'toggle' },
    ]"
  />
</template>

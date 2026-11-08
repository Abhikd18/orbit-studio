<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <AdminCollection
    collection="projects"
    title="Projects"
    description="Your portfolio. Each project gets its own page at /projects/your-slug."
    title-key="title"
    subtitle-key="summary"
    :defaults="{ title: '', slug: '', category: 'Web', summary: '', body: '', tagsText: '', gradient: 'linear-gradient(135deg,#7c5cff,#22d3ee)', link: '', featured: false, published: true }"
    :fields="[
      { key: 'title', label: 'Title', required: true, placeholder: 'Acme e-commerce store' },
      { key: 'slug', label: 'URL slug (optional)', placeholder: 'acme-store' },
      { key: 'category', label: 'Category', type: 'select', options: ['Web', 'Mobile', 'Dashboard', 'Cloud', 'E-commerce', 'Design'] },
      { key: 'summary', label: 'Short summary', required: true },
      { key: 'body', label: 'Full description (blank line = new paragraph)', type: 'textarea' },
      { key: 'tags', label: 'Tags / tech', type: 'tags' },
      { key: 'gradient', label: 'Cover colour', type: 'gradient' },
      { key: 'link', label: 'Live URL', type: 'url', placeholder: 'https://…' },
      { key: 'featured', label: 'Show on home page', type: 'toggle' },
      { key: 'published', label: 'Published', type: 'toggle' },
    ]"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <AdminCollection
    collection="testimonials"
    title="Testimonials"
    description="Real client quotes. The section appears on the home page once at least one is published."
    title-key="name"
    subtitle-key="quote"
    :defaults="{ name: '', role: '', quote: '', published: true }"
    :fields="[
      { key: 'name', label: 'Client name', required: true },
      { key: 'role', label: 'Role & company', placeholder: 'CEO, Acme' },
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'published', label: 'Published', type: 'toggle' },
    ]"
  />
</template>

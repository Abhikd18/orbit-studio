<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <AdminCollection
    collection="services"
    title="Services"
    description="The services grid on the home page."
    title-key="title"
    subtitle-key="text"
    :defaults="{ title: '', text: '', icon: 'spark' }"
    :fields="[
      { key: 'title', label: 'Title', required: true },
      { key: 'text', label: 'Description', type: 'textarea', required: true },
      { key: 'icon', label: 'Icon', type: 'select', options: ['globe', 'phone', 'chart', 'spark', 'cloud', 'cart', 'bolt', 'db', 'git', 'star'] },
    ]"
  />
</template>

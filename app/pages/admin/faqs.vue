<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
</script>

<template>
  <AdminCollection
    collection="faqs"
    title="FAQ"
    description="Questions shown on the home page (also shown in Google as rich results)."
    title-key="question"
    subtitle-key="answer"
    :defaults="{ question: '', answer: '', published: true }"
    :fields="[
      { key: 'question', label: 'Question', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      { key: 'published', label: 'Published', type: 'toggle' },
    ]"
  />
</template>

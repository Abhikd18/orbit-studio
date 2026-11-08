<script setup lang="ts">
import type { Faq } from '~/composables/useContent'
const props = defineProps<{ faqs: Faq[] }>()
// FAQ rich results for Google
useHead(() => ({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': props.faqs.map(f => ({ '@type': 'Question', 'name': f.question, 'acceptedAnswer': { '@type': 'Answer', 'text': f.answer } })),
    }).replace(/</g, '\\u003c'),
  }],
}))
</script>

<template>
  <div class="faqs">
    <details v-for="(f, i) in faqs" :key="f.id" v-reveal="i * 50" class="faq card" :open="i === 0">
      <summary>
        {{ f.question }}
        <span class="pm" aria-hidden="true" />
      </summary>
      <p>{{ f.answer }}</p>
    </details>
  </div>
</template>

<style scoped>
.faqs { display: grid; gap: 10px; }
.faq { padding: 0; transition: border-color .25s; }
.faq[open] { border-color: color-mix(in srgb, var(--accent) 45%, transparent); }
summary { list-style: none; cursor: pointer; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; }
summary::-webkit-details-marker { display: none; }
summary:focus-visible { outline: 2px solid var(--accent-2); outline-offset: -2px; border-radius: var(--radius); }
.pm { position: relative; width: 28px; height: 28px; flex: none; border-radius: 50%; border: 1px solid var(--border-strong); }
.pm::before, .pm::after { content: ''; position: absolute; left: 50%; top: 50%; width: 11px; height: 1.5px; background: currentColor; transform: translate(-50%, -50%); transition: transform .3s; }
.pm::after { transform: translate(-50%, -50%) rotate(90deg); }
.faq[open] .pm { background: var(--grad); border-color: transparent; }
.faq[open] .pm::after { transform: translate(-50%, -50%) rotate(0deg); }
p { padding: 0 24px 22px; color: var(--muted); max-width: 760px; }
</style>

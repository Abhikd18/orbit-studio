<script setup lang="ts">
const props = defineProps<{ number: string, brand: string }>()
const href = computed(() => `https://wa.me/${props.number}?text=${encodeURIComponent(`Hi ${props.brand}, I'd like to discuss a project.`)}`)
</script>

<template>
  <a :href="href" target="_blank" rel="noopener" class="wa" aria-label="Chat with us on WhatsApp">
    <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.5 6.5 0 0 0 1.4 3.4 14.7 14.7 0 0 0 5.6 5c2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.4Z" />
    </svg>
    <span class="label">Chat with us</span>
  </a>
</template>

<style scoped>
.wa { position: fixed; right: 20px; bottom: calc(20px + env(safe-area-inset-bottom)); z-index: 70; display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 999px; background: #25d366; color: #fff; box-shadow: 0 12px 40px -8px rgba(37, 211, 102, .6); transition: transform .25s, padding .25s; }
.wa:hover { transform: translateY(-3px); padding-right: 20px; }
.label { max-width: 0; overflow: hidden; white-space: nowrap; font-weight: 600; font-size: .9rem; transition: max-width .3s; }
.wa:hover .label, .wa:focus-visible .label { max-width: 140px; }
.wa::before { content: ''; position: absolute; inset: 0; border-radius: inherit; border: 2px solid #25d366; animation: ring 2.4s infinite; }
@keyframes ring { 0% { opacity: .8; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }
</style>

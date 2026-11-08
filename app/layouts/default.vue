<script setup lang="ts">
const { data } = await useContent()
const settings = computed(() => data.value?.settings)
// Brand colours come from the database → change them live in Admin → Settings
const theme = computed(() => ({
  '--accent': settings.value?.accent || '#7c5cff',
  '--accent-2': settings.value?.accent2 || '#22d3ee',
}))
useHead(() => ({
  htmlAttrs: { style: `--accent:${theme.value['--accent']};--accent-2:${theme.value['--accent-2']}` },
}))
</script>

<template>
  <div class="site" :style="theme">
    <BgFx />
    <SiteNav :brand="settings?.brandName || 'Orbit Studio'" :cta="settings?.ctaText || 'Start a project'" />
    <main>
      <slot />
    </main>
    <SiteFooter v-if="settings" :settings="settings" />
  </div>
</template>

<style scoped>
.site { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }
</style>

<script setup lang="ts">
const { data } = await useContent()
const active = ref('All')
const categories = computed(() => ['All', ...new Set((data.value?.projects || []).map(p => p.category))])
const list = computed(() => (data.value?.projects || []).filter(p => active.value === 'All' || p.category === active.value))
useSeoMeta({ title: () => `Work — ${data.value?.settings.brandName}` })
</script>

<template>
  <section class="section page">
    <div class="container">
      <div v-reveal class="section-head">
        <span class="eyebrow">Portfolio</span>
        <h1>Our <span class="grad-text">work</span></h1>
        <p>Every project below is loaded live from the database and managed in the admin dashboard.</p>
      </div>
      <div v-reveal="80" class="filters" role="tablist">
        <button v-for="c in categories" :key="c" role="tab" :aria-selected="active === c" :class="{ on: active === c }" @click="active = c">{{ c }}</button>
      </div>
      <TransitionGroup name="list" tag="div" class="grid">
        <ProjectCard v-for="p in list" :key="p.id" :project="p" />
      </TransitionGroup>
      <p v-if="!list.length" class="empty">No projects yet — add some from the admin dashboard.</p>
    </div>
  </section>
</template>

<style scoped>
.page { padding-top: 150px; }
h1 { font-size: clamp(2.6rem, 6vw, 4.4rem); margin-top: 14px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
.filters button { padding: 9px 18px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; color: var(--muted); transition: all .2s; }
.filters button:hover { color: var(--text); }
.filters button.on { background: var(--grad); color: #fff; border-color: transparent; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.empty { color: var(--muted); }
.list-enter-active, .list-leave-active { transition: all .35s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(.96); }
.list-leave-active { position: absolute; }
@media (max-width: 960px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .page { padding-top: 120px; } }
</style>

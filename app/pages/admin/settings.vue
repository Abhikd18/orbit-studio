<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data } = await useFetch<Record<string, string>>('/api/admin/settings', { headers: useRequestHeaders(['cookie']) })
const form = reactive<Record<string, string>>({ ...(data.value || {}) })
const saving = ref(false)
const msg = ref('')
const err = ref('')

const groups = [
  { title: 'Brand', fields: [
    { key: 'brandName', label: 'Brand name' },
    { key: 'ctaText', label: 'Main button text' },
  ] },
  { title: 'Hero section', fields: [
    { key: 'heroBadge', label: 'Badge' },
    { key: 'heroTitle', label: 'Headline' },
    { key: 'heroHighlight', label: 'Highlighted words (gradient)' },
    { key: 'heroSubtitle', label: 'Sub-headline', textarea: true },
  ] },
  { title: 'Contact details', fields: [
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
  ] },
]
const presets = [
  ['#7c5cff', '#22d3ee'], ['#f472b6', '#fbbf24'], ['#22c55e', '#06b6d4'], ['#ef4444', '#f97316'], ['#6366f1', '#ec4899'],
]

async function save() {
  saving.value = true
  msg.value = err.value = ''
  try {
    await $fetch('/api/admin/settings', { method: 'PUT', body: form })
    await refreshNuxtData('content')
    msg.value = 'Saved — your website is updated.'
    setTimeout(() => (msg.value = ''), 2500)
  }
  catch (e: any) {
    err.value = e?.data?.statusMessage || 'Save failed'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="settings" @submit.prevent="save">
    <div class="head">
      <div>
        <h1>Settings</h1>
        <p>Edit the website text and brand colours. Changes go live instantly.</p>
      </div>
      <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save changes' }}</button>
    </div>
    <p v-if="msg" class="ok"><Icon name="check" :size="16" /> {{ msg }}</p>
    <p v-if="err" class="err">{{ err }}</p>

    <section v-for="g in groups" :key="g.title" class="card group">
      <h2>{{ g.title }}</h2>
      <div class="grid">
        <div v-for="f in g.fields" :key="f.key" class="field" :class="{ wide: f.textarea }">
          <label :for="f.key">{{ f.label }}</label>
          <textarea v-if="f.textarea" :id="f.key" v-model="form[f.key]" class="input" rows="3" />
          <input v-else :id="f.key" v-model="form[f.key]" class="input">
        </div>
      </div>
    </section>

    <section class="card group">
      <h2>Brand colours</h2>
      <div class="colors">
        <label class="color"><input v-model="form.accent" type="color"> Primary <code>{{ form.accent }}</code></label>
        <label class="color"><input v-model="form.accent2" type="color"> Secondary <code>{{ form.accent2 }}</code></label>
      </div>
      <div class="presets">
        <button v-for="p in presets" :key="p.join()" type="button" class="preset" :style="{ background: `linear-gradient(120deg, ${p[0]}, ${p[1]})` }" :aria-label="`Use ${p.join(' and ')}`" @click="form.accent = p[0]!; form.accent2 = p[1]!" />
      </div>
      <div class="preview" :style="{ background: `linear-gradient(120deg, ${form.accent}, ${form.accent2})` }">Preview of your brand gradient</div>
    </section>
  </form>
</template>

<style scoped>
.settings { display: grid; gap: 18px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
h1 { font-size: 1.8rem; }
.head p { color: var(--muted); margin-top: 4px; }
.group { padding: 24px; display: grid; gap: 18px; }
.group h2 { font-size: 1.1rem; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.wide { grid-column: 1 / -1; }
.ok { color: var(--success); display: flex; gap: 8px; align-items: center; }
.err { color: var(--danger); }
.colors { display: flex; gap: 24px; flex-wrap: wrap; }
.color { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.color input { width: 46px; height: 46px; border: 0; padding: 0; background: none; cursor: pointer; border-radius: 12px; }
code { color: var(--muted); font-size: .85rem; }
.presets { display: flex; gap: 10px; flex-wrap: wrap; }
.preset { width: 40px; height: 40px; border-radius: 50%; border: 2px solid rgba(255,255,255,.2); cursor: pointer; }
.preview { padding: 22px; border-radius: 14px; font-family: var(--font-head); font-weight: 600; color: #fff; text-align: center; }
@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
</style>

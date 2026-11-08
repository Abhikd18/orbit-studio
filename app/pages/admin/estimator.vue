<script setup lang="ts">
import type { EstimatorConfig, PriceItem } from '~/composables/useContent'
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data } = await useContent()
const form = reactive<EstimatorConfig>(structuredClone(toRaw(data.value!.estimator)))
const saving = ref(false)
const msg = ref('')
const err = ref('')

const add = (list: PriceItem[]) => list.push({ id: Math.random().toString(36).slice(2, 8), label: '', price: 0 })
const remove = (list: PriceItem[], i: number) => list.splice(i, 1)

async function save() {
  saving.value = true
  msg.value = err.value = ''
  try {
    await $fetch('/api/admin/estimator', { method: 'PUT', body: form })
    await refreshNuxtData('content')
    msg.value = 'Saved — the calculator on your website is updated.'
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
  <form class="wrap" @submit.prevent="save">
    <div class="head">
      <div>
        <h1>Price estimator</h1>
        <p>Set the prices used by the calculator on your home page. The defaults are placeholders — use your real rates.</p>
      </div>
      <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save prices' }}</button>
    </div>
    <p v-if="msg" class="ok"><Icon name="check" :size="16" /> {{ msg }}</p>
    <p v-if="err" class="err">{{ err }}</p>

    <section class="card group">
      <h2>General</h2>
      <div class="grid4">
        <div class="field"><label for="cur">Currency symbol</label><input id="cur" v-model="form.currency" class="input"></div>
        <div class="field"><label for="pp">Price per extra page</label><input id="pp" v-model.number="form.pagePrice" type="number" min="0" class="input"></div>
        <div class="field"><label for="rush">Rush multiplier</label><input id="rush" v-model.number="form.rushMultiplier" type="number" step="0.05" min="1" max="3" class="input"></div>
        <div class="field"><label for="spread">Range ± (0.15 = 15%)</label><input id="spread" v-model.number="form.spread" type="number" step="0.05" min="0" max="0.5" class="input"></div>
      </div>
    </section>

    <section v-for="group in ([['Project types (base price)', form.types], ['Features (added on top)', form.features]] as const)" :key="group[0]" class="card group">
      <h2>{{ group[0] }}</h2>
      <div v-for="(item, i) in group[1]" :key="item.id" class="item">
        <input v-model="item.label" class="input" placeholder="Label" aria-label="Label" required>
        <div class="price">
          <span>{{ form.currency }}</span>
          <input v-model.number="item.price" type="number" min="0" class="input" aria-label="Price">
        </div>
        <button type="button" class="btn btn-sm btn-danger" aria-label="Remove" @click="remove(group[1], i)"><Icon name="trash" :size="16" /></button>
      </div>
      <button type="button" class="btn btn-sm add" @click="add(group[1])"><Icon name="plus" :size="16" /> Add</button>
    </section>
  </form>
</template>

<style scoped>
.wrap { display: grid; gap: 18px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
h1 { font-size: 1.8rem; }
.head p { color: var(--muted); margin-top: 4px; max-width: 620px; }
.group { padding: 24px; display: grid; gap: 12px; }
.group h2 { font-size: 1.1rem; margin-bottom: 4px; }
.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.item { display: grid; grid-template-columns: 1fr 180px auto; gap: 10px; align-items: center; }
.price { display: flex; align-items: center; gap: 8px; color: var(--muted); }
.add { justify-self: start; }
.ok { color: var(--success); display: flex; gap: 8px; align-items: center; }
.err { color: var(--danger); }
@media (max-width: 800px) { .grid4 { grid-template-columns: 1fr 1fr; } .item { grid-template-columns: 1fr 130px auto; } }
</style>

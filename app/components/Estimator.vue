<script setup lang="ts">
import type { EstimatorConfig } from '~/composables/useContent'
const props = defineProps<{ config: EstimatorConfig }>()

const typeId = ref(props.config.types[0]?.id || '')
const pages = ref(5)
const features = ref<string[]>([])
const rush = ref(false)

const type = computed(() => props.config.types.find(t => t.id === typeId.value))
const total = computed(() => {
  const base = (type.value?.price || 0) + Math.max(0, pages.value - 1) * props.config.pagePrice
  const extras = props.config.features.filter(f => features.value.includes(f.id)).reduce((s, f) => s + f.price, 0)
  return (base + extras) * (rush.value ? props.config.rushMultiplier : 1)
})
const round = (n: number) => Math.round(n / 500) * 500
const low = computed(() => round(total.value * (1 - props.config.spread)))
const high = computed(() => round(total.value * (1 + props.config.spread)))
const fmt = (n: number) => props.config.currency + n.toLocaleString('en-IN')

// smooth number animation
const shownLow = ref(low.value)
const shownHigh = ref(high.value)
let raf = 0
watch([low, high], ([l, h]) => {
  if (import.meta.server) return
  cancelAnimationFrame(raf)
  const [fl, fh] = [shownLow.value, shownHigh.value]
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / 450)
    const e = 1 - (1 - p) ** 3
    shownLow.value = Math.round(fl + (l - fl) * e)
    shownHigh.value = Math.round(fh + (h - fh) * e)
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
})

const summary = computed(() => [
  `Project: ${type.value?.label}`,
  `Pages / screens: ${pages.value}`,
  `Features: ${props.config.features.filter(f => features.value.includes(f.id)).map(f => f.label).join(', ') || 'none'}`,
  `Timeline: ${rush.value ? 'Rush' : 'Standard'}`,
  `Estimate: ${fmt(low.value)} – ${fmt(high.value)}`,
].join('\n'))

// send estimate as a lead
const form = reactive({ name: '', email: '', note: '' })
const state = ref<'idle' | 'open' | 'sending' | 'sent'>('idle')
const error = ref('')
async function send() {
  state.value = 'sending'
  error.value = ''
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      baseURL: useApiBase(),
      body: {
        name: form.name,
        email: form.email,
        budget: `Estimate ${fmt(low.value)}–${fmt(high.value)}`,
        message: `${summary.value}${form.note ? `\n\nNote: ${form.note}` : ''}`,
      },
    })
    state.value = 'sent'
  }
  catch (e: any) {
    state.value = 'open'
    error.value = e?.data?.statusMessage || 'Could not send. Please try again.'
  }
}
</script>

<template>
  <div class="est">
    <div class="opts card">
      <fieldset>
        <legend><span class="n">1</span> What do you need?</legend>
        <div class="types">
          <label v-for="t in config.types" :key="t.id" class="opt" :class="{ on: typeId === t.id }">
            <input v-model="typeId" type="radio" name="est-type" :value="t.id">
            {{ t.label }}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span class="n">2</span> How many pages or screens? <b class="pv">{{ pages }}</b></legend>
        <input v-model.number="pages" type="range" min="1" max="40" class="range" aria-label="Number of pages or screens" :style="{ '--p': `${((pages - 1) / 39) * 100}%` }">
        <div class="scale"><span>1</span><span>20</span><span>40</span></div>
      </fieldset>

      <fieldset>
        <legend><span class="n">3</span> Features</legend>
        <div class="feats">
          <label v-for="f in config.features" :key="f.id" class="feat" :class="{ on: features.includes(f.id) }">
            <input v-model="features" type="checkbox" :value="f.id">
            <span class="box"><Icon name="check" :size="14" /></span>
            {{ f.label }}
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span class="n">4</span> Timeline</legend>
        <div class="types two">
          <label class="opt" :class="{ on: !rush }"><input v-model="rush" type="radio" :value="false" name="est-rush"> Standard</label>
          <label class="opt" :class="{ on: rush }"><input v-model="rush" type="radio" :value="true" name="est-rush"> Rush (faster delivery)</label>
        </div>
      </fieldset>
    </div>

    <aside class="result card">
      <div class="glow" />
      <small>Estimated investment</small>
      <div class="price">
        <span class="grad-text">{{ fmt(shownLow) }}</span>
        <span class="dash">–</span>
        <span class="grad-text">{{ fmt(shownHigh) }}</span>
      </div>
      <ul class="lines">
        <li><span>{{ type?.label }}</span><span>{{ pages }} {{ pages === 1 ? 'page' : 'pages' }}</span></li>
        <li v-if="features.length"><span>Features</span><span>{{ features.length }} selected</span></li>
        <li><span>Timeline</span><span>{{ rush ? 'Rush' : 'Standard' }}</span></li>
      </ul>
      <p class="fine">A ballpark range to help you plan. You get an exact, fixed quote after a short call.</p>

      <Transition name="fade" mode="out-in">
        <div v-if="state === 'sent'" class="sent">
          <Icon name="check" :size="22" /> Sent! We’ll reply with an exact quote.
        </div>
        <form v-else-if="state !== 'idle'" class="mini" @submit.prevent="send">
          <input v-model="form.name" class="input" placeholder="Your name" required autocomplete="name" aria-label="Your name">
          <input v-model="form.email" class="input" type="email" placeholder="Email" required autocomplete="email" aria-label="Email">
          <input v-model="form.note" class="input" placeholder="Anything else? (optional)" aria-label="Note">
          <p v-if="error" class="err">{{ error }}</p>
          <button class="btn btn-primary" :disabled="state === 'sending'">{{ state === 'sending' ? 'Sending…' : 'Send me this quote' }}</button>
        </form>
        <button v-else class="btn btn-primary" @click="state = 'open'">Get an exact quote <Icon name="arrow" :size="18" /></button>
      </Transition>
    </aside>
  </div>
</template>

<style scoped>
.est { display: grid; grid-template-columns: 1.35fr 1fr; gap: 20px; align-items: start; }
.opts { padding: 28px; display: grid; gap: 28px; }
fieldset { border: 0; padding: 0; margin: 0; min-width: 0; }
legend { display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-weight: 600; font-size: 1.05rem; margin-bottom: 14px; width: 100%; }
.n { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: .8rem; background: color-mix(in srgb, var(--accent) 25%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent); }
.pv { margin-left: auto; font-size: 1.3rem; }
.types { display: flex; flex-wrap: wrap; gap: 8px; }
.opt { position: relative; padding: 10px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: .92rem; color: var(--muted); transition: all .2s; }
.opt input, .feat input { position: absolute; opacity: 0; pointer-events: none; }
.opt:hover { color: var(--text); border-color: var(--border-strong); }
.opt.on { color: #fff; background: var(--grad); border-color: transparent; box-shadow: 0 8px 30px -10px var(--accent); }
.opt:has(input:focus-visible), .feat:has(input:focus-visible) { outline: 2px solid var(--accent-2); outline-offset: 2px; }
.range { width: 100%; appearance: none; -webkit-appearance: none; height: 6px; border-radius: 99px; background: linear-gradient(90deg, var(--accent) var(--p), var(--surface-2) var(--p)); outline: none; }
.range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 40%, transparent); cursor: grab; }
.range::-moz-range-thumb { width: 22px; height: 22px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent) 40%, transparent); cursor: grab; }
.range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 6px var(--accent-2); }
.scale { display: flex; justify-content: space-between; font-size: .75rem; color: var(--faint); margin-top: 8px; }
.feats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.feat { position: relative; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: .9rem; transition: all .2s; }
.feat:hover { border-color: var(--border-strong); }
.feat.on { border-color: color-mix(in srgb, var(--accent) 60%, transparent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.box { width: 20px; height: 20px; flex: none; border-radius: 6px; border: 1px solid var(--border-strong); display: grid; place-items: center; color: transparent; transition: all .2s; }
.feat.on .box { background: var(--grad); border-color: transparent; color: #fff; }
.result { position: sticky; top: 96px; padding: 30px; display: grid; gap: 18px; overflow: hidden; }
.glow { position: absolute; width: 300px; height: 300px; right: -120px; top: -120px; border-radius: 50%; background: var(--accent); filter: blur(80px); opacity: .35; pointer-events: none; }
.result small { color: var(--muted); text-transform: uppercase; letter-spacing: .14em; font-size: .75rem; }
.price { font-family: var(--font-head); font-weight: 700; font-size: clamp(1.8rem, 3.6vw, 2.5rem); line-height: 1.1; display: flex; flex-wrap: wrap; gap: 4px 10px; font-variant-numeric: tabular-nums; }
.dash { color: var(--faint); }
.lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; border-top: 1px solid var(--border); padding-top: 16px; font-size: .9rem; }
.lines li { display: flex; justify-content: space-between; gap: 10px; color: var(--muted); }
.lines li span:last-child { color: var(--text); }
.fine { font-size: .8rem; color: var(--faint); }
.mini { display: grid; gap: 10px; }
.err { color: var(--danger); font-size: .85rem; }
.sent { display: flex; gap: 10px; align-items: center; color: var(--success); }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 900px) { .est { grid-template-columns: 1fr; } .result { position: static; } }
@media (max-width: 520px) { .feats { grid-template-columns: 1fr; } .opts { padding: 20px; } }
</style>

<script setup lang="ts">
// Public, unlisted proposal page that clients open from the link you send them.
definePageMeta({ layout: false })
const route = useRoute()
const token = String(route.params.token)
const { data: p, error, refresh } = await useFetch<any>(`/api/proposals/${token}`, { baseURL: useApiBase(), headers: useRequestHeaders(['cookie']) })
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Proposal not found', fatal: true })

useHead(() => ({
  title: `${p.value?.title} — ${p.value?.brand.name}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }, { name: 'referrer', content: 'no-referrer' }],
  htmlAttrs: { style: `--accent:${p.value?.brand.accent || '#7c5cff'};--accent-2:${p.value?.brand.accent2 || '#22d3ee'}` },
}))

const printDoc = () => window.print()
const money = (n: number) => formatMoney(n, p.value?.currency)
const paragraphs = computed(() => String(p.value?.intro || '').split(/\n\s*\n/).filter(Boolean))
const terms = computed(() => String(p.value?.terms || '').split('\n').map(t => t.trim()).filter(Boolean))
const open = computed(() => p.value && ['sent', 'viewed'].includes(p.value.status) && !p.value.expired)
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '')

const name = ref('')
const agree = ref(false)
const comment = ref('')
const mode = ref<'accept' | 'decline'>('accept')
const busy = ref(false)
const err = ref('')
async function respond() {
  err.value = ''
  busy.value = true
  try {
    await $fetch(`/api/proposals/${token}`, { method: 'POST', baseURL: useApiBase(), body: { action: mode.value, name: name.value, comment: comment.value } })
    await refresh()
  }
  catch (e: any) {
    err.value = e?.data?.statusMessage || 'Something went wrong. Please try again.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="p" class="doc-page">
    <BgFx class="no-print" />
    <div v-if="p.preview" class="preview no-print">
      Admin preview<template v-if="p.status === 'draft'"> — this draft is not visible to the client until you mark it as sent</template>.
    </div>
    <article class="doc">
      <header class="hd">
        <div class="brand"><span class="mark" />{{ p.brand.name }}</div>
        <button class="btn btn-sm no-print" @click="printDoc"><Icon name="download" :size="14" /> Save as PDF</button>
      </header>

      <section class="title">
        <span class="eyebrow">Proposal</span>
        <h1>{{ p.title }}</h1>
        <div class="meta">
          <div><small>Prepared for</small><b>{{ p.clientName }}</b><span v-if="p.clientCompany">{{ p.clientCompany }}</span></div>
          <div><small>Date</small><b>{{ fmt(p.sentAt || p.createdAt) }}</b></div>
          <div v-if="p.validUntil"><small>Valid until</small><b>{{ fmt(p.validUntil) }}</b></div>
          <div><small>Total investment</small><b class="grad-text">{{ money(p.total) }}</b></div>
        </div>
      </section>

      <section class="intro">
        <p v-for="(t, i) in paragraphs" :key="i">{{ t }}</p>
      </section>

      <section>
        <h2>Scope &amp; investment</h2>
        <table class="items">
          <thead><tr><th>Item</th><th class="r">Price</th></tr></thead>
          <tbody>
            <tr v-for="it in p.items" :key="it.id">
              <td><b>{{ it.label }}</b><span v-if="it.detail">{{ it.detail }}</span></td>
              <td class="r">{{ money(it.price) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr><td>Subtotal</td><td class="r">{{ money(p.subtotal) }}</td></tr>
            <tr v-if="p.taxPercent"><td>{{ p.taxLabel }} ({{ p.taxPercent }}%)</td><td class="r">{{ money(p.tax) }}</td></tr>
            <tr class="grand"><td>Total</td><td class="r">{{ money(p.total) }}</td></tr>
          </tfoot>
        </table>
      </section>

      <section v-if="p.milestones.length">
        <h2>Payment schedule</h2>
        <ol class="steps">
          <li v-for="m in p.milestones" :key="m.id">
            <span>{{ m.label }}</span>
            <small>{{ m.percent }}%</small>
            <b>{{ money(m.amount) }}</b>
          </li>
        </ol>
      </section>

      <section v-if="p.timeline" class="two">
        <div><h2>Timeline</h2><p>{{ p.timeline }}</p></div>
      </section>

      <section v-if="terms.length">
        <h2>Terms</h2>
        <ul class="terms"><li v-for="(t, i) in terms" :key="i">{{ t }}</li></ul>
      </section>

      <!-- response -->
      <section class="respond">
        <div v-if="p.status === 'accepted'" class="state good">
          <Icon name="check" :size="22" />
          <div><b>Accepted</b><span>Signed by {{ p.signedName }} on {{ fmt(p.respondedAt) }}. Thank you — we’ll be in touch about next steps.</span></div>
        </div>
        <div v-else-if="p.status === 'declined'" class="state bad">
          <div><b>Declined</b><span>on {{ fmt(p.respondedAt) }}. Thanks for considering us — we’re happy to revisit any time.</span></div>
        </div>
        <div v-else-if="p.expired" class="state bad">
          <div><b>This proposal has expired</b><span>Prices may have changed. Contact us below for an updated proposal.</span></div>
        </div>
        <form v-else-if="open" class="accept no-print" @submit.prevent="respond">
          <div class="tabs" role="tablist">
            <button type="button" role="tab" :aria-selected="mode === 'accept'" :class="{ on: mode === 'accept' }" @click="mode = 'accept'">Accept proposal</button>
            <button type="button" role="tab" :aria-selected="mode === 'decline'" :class="{ on: mode === 'decline' }" @click="mode = 'decline'">Decline</button>
          </div>
          <template v-if="mode === 'accept'">
            <div class="field">
              <label for="sig">Type your full name to sign</label>
              <input id="sig" v-model="name" class="input sig" autocomplete="name" required minlength="2" placeholder="Your full name">
            </div>
            <label class="chk"><input v-model="agree" type="checkbox" required> I agree to the scope, payment schedule and terms above.</label>
            <div class="field">
              <label for="cm">Message (optional)</label>
              <textarea id="cm" v-model="comment" class="input" rows="2" />
            </div>
            <button class="btn btn-primary" :disabled="busy || !agree || name.trim().length < 2">{{ busy ? 'Submitting…' : `Accept & sign — ${money(p.total)}` }}</button>
          </template>
          <template v-else>
            <div class="field">
              <label for="why">Could you tell us why? (optional)</label>
              <textarea id="why" v-model="comment" class="input" rows="3" placeholder="Budget, timing, scope…" />
            </div>
            <button class="btn btn-danger" :disabled="busy">{{ busy ? 'Submitting…' : 'Decline proposal' }}</button>
          </template>
          <p v-if="err" class="err">{{ err }}</p>
        </form>
      </section>

      <footer class="ft">
        <span>Questions? Contact {{ p.brand.name }}</span>
        <a v-if="p.brand.email" :href="`mailto:${p.brand.email}`">{{ p.brand.email }}</a>
        <a v-if="p.brand.phone" :href="`tel:${p.brand.phone.replace(/\s/g, '')}`">{{ p.brand.phone }}</a>
        <a v-if="p.brand.whatsapp" :href="`https://wa.me/${p.brand.whatsapp}`" target="_blank" rel="noopener" class="no-print">WhatsApp</a>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.doc-page { min-height: 100vh; padding: 40px 16px 80px; }
.preview { max-width: 860px; margin: 0 auto 14px; padding: 10px 14px; border-radius: 12px; background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.35); color: #fde68a; font-size: .88rem; }
.doc { max-width: 860px; margin: 0 auto; padding: clamp(24px, 5vw, 56px); border-radius: 24px; background: rgba(10,12,27,.85); border: 1px solid var(--border); backdrop-filter: blur(16px); display: grid; gap: 40px; }
.hd { display: flex; justify-content: space-between; align-items: center; }
.brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-head); font-weight: 700; font-size: 1.15rem; }
.mark { width: 26px; height: 26px; border-radius: 50%; background: var(--grad); box-shadow: 0 0 20px var(--accent); }
h1 { font-size: clamp(2rem, 5vw, 3rem); margin-top: 10px; }
h2 { font-size: 1.15rem; margin-bottom: 14px; }
.meta { margin-top: 26px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; padding: 18px; border-radius: 16px; border: 1px solid var(--border); background: var(--surface); }
.meta div { display: grid; gap: 2px; }
.meta small { color: var(--faint); font-size: .72rem; text-transform: uppercase; letter-spacing: .12em; }
.meta span { color: var(--muted); font-size: .88rem; }
.meta .grad-text { font-family: var(--font-head); font-size: 1.3rem; }
.intro { display: grid; gap: 14px; color: #d4d8ee; font-size: 1.05rem; line-height: 1.75; white-space: pre-line; }
.items { width: 100%; border-collapse: collapse; }
.items th { text-align: left; font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; color: var(--faint); padding: 0 0 10px; border-bottom: 1px solid var(--border); }
.items td { padding: 14px 0; border-bottom: 1px solid var(--border); vertical-align: top; }
.items td b { display: block; }
.items td span { display: block; color: var(--muted); font-size: .9rem; margin-top: 2px; }
.items tfoot td { border: 0; padding: 6px 0; color: var(--muted); }
.items .grand td { padding-top: 12px; font-family: var(--font-head); font-size: 1.3rem; color: var(--text); border-top: 1px solid var(--border-strong); }
.items .r { text-align: right; white-space: nowrap; padding-left: 16px !important; }
.steps { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; counter-reset: s; }
.steps li { counter-increment: s; display: grid; grid-template-columns: 30px 1fr auto auto; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); }
.steps li::before { content: counter(s); width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: .8rem; font-weight: 700; background: var(--grad); color: #fff; }
.steps small { color: var(--muted); }
.two p { color: #d4d8ee; }
.terms { margin: 0; padding-left: 18px; display: grid; gap: 8px; color: var(--muted); }
.respond { border-top: 1px solid var(--border); padding-top: 32px; }
.state { display: flex; gap: 14px; align-items: flex-start; padding: 18px; border-radius: 16px; }
.state div { display: grid; gap: 2px; }
.state span { color: var(--muted); }
.state.good { background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.35); color: #6ee7b7; }
.state.bad { background: rgba(251,113,133,.08); border: 1px solid rgba(251,113,133,.3); color: #fda4af; }
.accept { display: grid; gap: 16px; max-width: 520px; }
.tabs { display: flex; gap: 6px; }
.tabs button { padding: 8px 14px; border-radius: 99px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; }
.tabs button.on { background: var(--grad); color: #fff; border-color: transparent; }
.sig { font-family: 'Brush Script MT', 'Segoe Script', cursive; font-size: 1.5rem; padding: 10px 14px; }
.chk { display: flex; gap: 10px; align-items: flex-start; font-size: .92rem; color: var(--muted); cursor: pointer; }
.chk input { margin-top: 4px; accent-color: var(--accent); }
.err { color: var(--danger); }
.ft { display: flex; flex-wrap: wrap; gap: 8px 18px; color: var(--muted); font-size: .88rem; border-top: 1px solid var(--border); padding-top: 22px; }
.ft a { color: var(--accent-2); }
@media (max-width: 560px) { .steps li { grid-template-columns: 30px 1fr auto; } .steps small { display: none; } }

@media print {
  .no-print { display: none !important; }
  .doc-page { padding: 0; background: #fff; }
  .doc { background: #fff; color: #111; border: 0; border-radius: 0; backdrop-filter: none; padding: 0; gap: 26px; max-width: none; }
  .doc :is(p, span, small, td, th, li) { color: #333 !important; }
  .meta, .steps li { background: #f6f6f8; border-color: #ddd; }
  .items td, .items th { border-color: #ddd; }
  .grad-text { -webkit-text-fill-color: #111; color: #111; }
  .state { border-color: #ccc; }
}
</style>
<style>
@media print { body { background: #fff !important; } }
</style>

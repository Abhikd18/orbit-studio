<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const route = useRoute()
const id = String(route.params.id)
const { data, error } = await useFetch<any>(`/api/admin/proposals/${id}`, { headers: useRequestHeaders(['cookie']) })
if (error.value) throw createError({ statusCode: 404, statusMessage: 'Proposal not found' })

const form = reactive<any>(structuredClone(toRaw(data.value)))
const saved = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== saved.value)
const locked = computed(() => ['accepted', 'declined'].includes(form.status))
const saving = ref(false)
const msg = ref('')
const err = ref('')

const subtotal = computed(() => form.items.reduce((s: number, i: any) => s + (Number(i.price) || 0), 0))
const tax = computed(() => Math.round(subtotal.value * (Number(form.taxPercent) || 0)) / 100)
const total = computed(() => subtotal.value + tax.value)
const pctSum = computed(() => form.milestones.reduce((s: number, m: any) => s + (Number(m.percent) || 0), 0))
// full URL is only known in the browser; set after mount to avoid a hydration mismatch
const origin = ref('')
onMounted(() => (origin.value = location.origin))
const link = computed(() => `${origin.value}/p/${form.token}`)
const rid = () => Math.random().toString(36).slice(2, 9)

async function save(action?: 'send' | 'reopen') {
  saving.value = true
  msg.value = err.value = ''
  try {
    const res = await $fetch<any>(`/api/admin/proposals/${id}`, { method: 'PUT', body: { ...form, action } })
    Object.assign(form, res)
    saved.value = JSON.stringify(form)
    msg.value = action === 'send' ? 'Marked as sent — share the link with your client.' : action === 'reopen' ? 'Reopened as draft.' : 'Saved.'
    setTimeout(() => (msg.value = ''), 3000)
  }
  catch (e: any) {
    err.value = e?.data?.statusMessage || 'Save failed'
  }
  finally {
    saving.value = false
  }
}
async function copyLink() {
  await navigator.clipboard.writeText(link.value)
  msg.value = 'Link copied'
  setTimeout(() => (msg.value = ''), 2000)
}
const mailto = computed(() => `mailto:${form.clientEmail}?subject=${encodeURIComponent(`Proposal: ${form.title}`)}&body=${encodeURIComponent(`Hi ${form.clientName?.split(' ')[0] || ''},\n\nHere is our proposal for your project:\n${link.value}\n\nYou can review the scope and accept it online. Let me know if you have any questions.\n\nBest regards`)}`)
const whatsapp = computed(() => `https://wa.me/?text=${encodeURIComponent(`Hi ${form.clientName?.split(' ')[0] || ''}, here is our proposal for your project: ${link.value}`)}`)
async function remove() {
  if (!confirm('Delete this proposal? The client link will stop working.')) return
  await $fetch(`/api/admin/proposals/${id}`, { method: 'DELETE' })
  await navigateTo('/admin/proposals')
}
onBeforeRouteLeave(() => (dirty.value && !locked.value ? confirm('You have unsaved changes. Leave anyway?') : true))
const fmt = (d?: string) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '')
</script>

<template>
  <div class="ed">
    <div class="bar">
      <NuxtLink to="/admin/proposals" class="back"><Icon name="arrowLeft" :size="16" /> Proposals</NuxtLink>
      <span class="pill" :class="form.status">{{ form.status }}</span>
      <div class="acts">
        <a :href="`/p/${form.token}`" target="_blank" class="btn btn-sm"><Icon name="eye" :size="16" /> Preview</a>
        <template v-if="form.status !== 'draft'">
          <button class="btn btn-sm" @click="copyLink"><Icon name="grid" :size="16" /> Copy link</button>
          <a v-if="form.clientEmail" :href="mailto" class="btn btn-sm"><Icon name="mail" :size="16" /> Email</a>
          <a :href="whatsapp" target="_blank" rel="noopener" class="btn btn-sm">WhatsApp</a>
        </template>
        <button v-if="locked" class="btn btn-sm" @click="save('reopen')">Reopen</button>
        <button v-else-if="form.status === 'draft'" class="btn btn-sm btn-primary" :disabled="saving" @click="save('send')">Mark as sent</button>
        <button v-if="!locked" class="btn btn-sm btn-primary" :disabled="saving || !dirty" @click="save()">{{ saving ? 'Saving…' : dirty ? 'Save' : 'Saved' }}</button>
      </div>
    </div>
    <p v-if="msg" class="ok"><Icon name="check" :size="16" /> {{ msg }}</p>
    <p v-if="err" class="err">{{ err }}</p>

    <div v-if="form.status === 'accepted'" class="banner good">
      <Icon name="check" /> Accepted by <b>{{ form.signedName }}</b> on {{ fmt(form.respondedAt) }}<span v-if="form.clientComment"> — “{{ form.clientComment }}”</span>
    </div>
    <div v-else-if="form.status === 'declined'" class="banner bad">
      Declined on {{ fmt(form.respondedAt) }}<span v-if="form.clientComment"> — “{{ form.clientComment }}”</span>
    </div>
    <div v-else-if="form.status === 'viewed'" class="banner warn"><Icon name="eye" /> Client opened it on {{ fmt(form.viewedAt) }}</div>

    <div class="grid">
      <fieldset :disabled="locked" class="main">
        <section class="card sec">
          <h2>Client</h2>
          <div class="three">
            <div class="field"><label for="cn">Name</label><input id="cn" v-model="form.clientName" class="input" required></div>
            <div class="field"><label for="ce">Email</label><input id="ce" v-model="form.clientEmail" type="email" class="input"></div>
            <div class="field"><label for="cc">Company (optional)</label><input id="cc" v-model="form.clientCompany" class="input"></div>
          </div>
        </section>

        <section class="card sec">
          <h2>Proposal</h2>
          <div class="field"><label for="pt">Title</label><input id="pt" v-model="form.title" class="input"></div>
          <div class="field"><label for="pi">Introduction</label><textarea id="pi" v-model="form.intro" class="input" rows="5" /></div>
        </section>

        <section class="card sec">
          <h2>Scope &amp; investment</h2>
          <div v-for="(it, i) in form.items" :key="it.id" class="item">
            <div class="item-main">
              <input v-model="it.label" class="input" placeholder="Item, e.g. Website design" aria-label="Item">
              <input v-model="it.detail" class="input small" placeholder="What’s included (optional)" aria-label="Details">
            </div>
            <div class="price"><span>{{ form.currency }}</span><input v-model.number="it.price" type="number" min="0" class="input" aria-label="Price"></div>
            <button type="button" class="btn btn-sm btn-danger" aria-label="Remove item" @click="form.items.splice(i, 1)"><Icon name="trash" :size="14" /></button>
          </div>
          <button type="button" class="btn btn-sm add" @click="form.items.push({ id: rid(), label: '', detail: '', price: 0 })"><Icon name="plus" :size="14" /> Add item</button>
          <div class="three">
            <div class="field"><label for="tl">Tax label</label><input id="tl" v-model="form.taxLabel" class="input"></div>
            <div class="field"><label for="tp">Tax %</label><input id="tp" v-model.number="form.taxPercent" type="number" min="0" max="100" class="input"></div>
            <div class="field"><label for="cur">Currency</label><input id="cur" v-model="form.currency" class="input"></div>
          </div>
        </section>

        <section class="card sec">
          <h2>Payment schedule <small :class="{ bad: pctSum !== 100 }">{{ pctSum }}% of 100%</small></h2>
          <div v-for="(m, i) in form.milestones" :key="m.id" class="item">
            <input v-model="m.label" class="input" placeholder="Milestone" aria-label="Milestone">
            <div class="price"><input v-model.number="m.percent" type="number" min="0" max="100" class="input" aria-label="Percent"><span>%</span></div>
            <span class="amt">{{ formatMoney(Math.round(total * (m.percent || 0)) / 100, form.currency) }}</span>
            <button type="button" class="btn btn-sm btn-danger" aria-label="Remove milestone" @click="form.milestones.splice(i, 1)"><Icon name="trash" :size="14" /></button>
          </div>
          <button type="button" class="btn btn-sm add" @click="form.milestones.push({ id: rid(), label: '', percent: 0 })"><Icon name="plus" :size="14" /> Add milestone</button>
        </section>

        <section class="card sec">
          <h2>Timeline &amp; terms</h2>
          <div class="two">
            <div class="field"><label for="tm">Timeline</label><input id="tm" v-model="form.timeline" class="input"></div>
            <div class="field"><label for="vu">Valid until</label><input id="vu" v-model="form.validUntil" type="date" class="input"></div>
          </div>
          <div class="field"><label for="tr">Terms (one per line)</label><textarea id="tr" v-model="form.terms" class="input" rows="5" /></div>
        </section>
      </fieldset>

      <aside class="side">
        <div class="card sum">
          <small>Total</small>
          <b class="grad-text">{{ formatMoney(total, form.currency) }}</b>
          <div class="line"><span>Subtotal</span><span>{{ formatMoney(subtotal, form.currency) }}</span></div>
          <div class="line"><span>{{ form.taxLabel || 'Tax' }} {{ form.taxPercent }}%</span><span>{{ formatMoney(tax, form.currency) }}</span></div>
          <p v-if="pctSum !== 100" class="warnline">Payment milestones add up to {{ pctSum }}%, not 100%.</p>
          <p v-if="form.status === 'draft'" class="hint">Drafts are private. Click <b>Mark as sent</b> to activate the client link.</p>
          <p v-else class="hint">Client link:<br><code>{{ link }}</code></p>
          <button class="btn btn-sm btn-danger" @click="remove"><Icon name="trash" :size="14" /> Delete proposal</button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.ed { display: grid; gap: 16px; }
.bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; position: sticky; top: 0; z-index: 5; padding: 10px 0; background: linear-gradient(var(--bg) 70%, transparent); }
.back { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: .9rem; }
.acts { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
.pill { padding: 4px 10px; border-radius: 99px; font-size: .75rem; text-transform: capitalize; background: var(--surface-2); color: var(--muted); }
.pill.sent, .pill.viewed { color: #fbbf24; } .pill.accepted { color: #34d399; } .pill.declined { color: #fb7185; }
.ok { color: var(--success); display: flex; gap: 8px; align-items: center; }
.err { color: var(--danger); }
.banner { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 14px; flex-wrap: wrap; }
.banner.good { background: rgba(52,211,153,.1); border: 1px solid rgba(52,211,153,.35); color: #a7f3d0; }
.banner.bad { background: rgba(251,113,133,.1); border: 1px solid rgba(251,113,133,.35); color: #fecdd3; }
.banner.warn { background: rgba(251,191,36,.08); border: 1px solid rgba(251,191,36,.3); color: #fde68a; }
.grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; align-items: start; }
.main { border: 0; padding: 0; margin: 0; min-width: 0; display: grid; gap: 14px; }
.main:disabled { opacity: .7; }
.sec { padding: 22px; display: grid; gap: 14px; }
.sec h2 { font-size: 1.05rem; display: flex; justify-content: space-between; align-items: center; }
.sec h2 small { font-size: .8rem; color: var(--success); font-weight: 500; }
.sec h2 small.bad { color: #fbbf24; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.item { display: grid; grid-template-columns: 1fr 170px auto; gap: 8px; align-items: start; }
.item:has(.amt) { grid-template-columns: 1fr 110px 120px auto; align-items: center; }
.item-main { display: grid; gap: 6px; }
.input.small { padding: 8px 12px; font-size: .88rem; }
.price { display: flex; align-items: center; gap: 6px; color: var(--muted); }
.amt { text-align: right; color: var(--muted); font-size: .9rem; }
.add { justify-self: start; }
.side { position: sticky; top: 70px; }
.sum { padding: 22px; display: grid; gap: 10px; }
.sum small { color: var(--muted); text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; }
.sum > b { font-family: var(--font-head); font-size: 2rem; }
.line { display: flex; justify-content: space-between; color: var(--muted); font-size: .9rem; }
.warnline { color: #fbbf24; font-size: .85rem; }
.hint { color: var(--muted); font-size: .85rem; border-top: 1px solid var(--border); padding-top: 10px; }
code { color: var(--accent-2); word-break: break-all; font-size: .8rem; }
@media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } .side { position: static; } }
@media (max-width: 640px) { .three, .two { grid-template-columns: 1fr; } .item, .item:has(.amt) { grid-template-columns: 1fr auto; } .item .price, .amt { grid-column: 1; } }
</style>

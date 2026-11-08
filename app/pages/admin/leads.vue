<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

interface Note { id: string, text: string, at: string }
interface Lead {
  id: string, name: string, email: string, budget?: string, message: string, createdAt: string
  read?: boolean, status?: string, value?: number, followUp?: string, notes?: Note[]
}
const headers = useRequestHeaders(['cookie'])
const { data: leads, refresh } = await useFetch<Lead[]>('/api/admin/collection/messages', { headers, default: () => [] })
const { data: proposals, refresh: refreshProposals } = await useFetch<any[]>('/api/admin/proposals', { headers, default: () => [] })
const { data: content } = await useContent()
const cur = computed(() => content.value?.estimator.currency || '₹')

const STAGES = [
  { id: 'new', label: 'New', color: '#22d3ee' },
  { id: 'contacted', label: 'Contacted', color: '#a78bfa' },
  { id: 'proposal', label: 'Proposal sent', color: '#fbbf24' },
  { id: 'won', label: 'Won', color: '#34d399' },
  { id: 'lost', label: 'Lost', color: '#fb7185' },
]
const stageOf = (l: Lead) => l.status || 'new'
const q = ref('')
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return (leads.value || []).filter(l => !s || [l.name, l.email, l.message, l.budget].some(v => v?.toLowerCase().includes(s)))
})
const columns = computed(() => STAGES.map(st => {
  const items = filtered.value.filter(l => stageOf(l) === st.id)
  return { ...st, items, value: items.reduce((a, l) => a + (Number(l.value) || 0), 0) }
}))
const today = todayIST()
const fuState = (l: Lead) => !l.followUp || ['won', 'lost'].includes(stageOf(l)) ? '' : l.followUp < today ? 'overdue' : l.followUp === today ? 'today' : 'later'

// ---- updates ----
const toast = ref('')
const notify = (m: string) => { toast.value = m; setTimeout(() => (toast.value = ''), 2000) }
async function patch(lead: Lead, body: Partial<Lead>) {
  Object.assign(lead, body) // optimistic
  try {
    await $fetch(`/api/admin/collection/messages/${lead.id}`, { method: 'PUT', body })
  }
  catch {
    notify('Could not save — refreshing')
    await refresh()
  }
}

// drag & drop between columns
const dragId = ref('')
const overCol = ref('')
function drop(stage: string) {
  const lead = leads.value.find(l => l.id === dragId.value)
  overCol.value = dragId.value = ''
  if (lead && stageOf(lead) !== stage) {
    patch(lead, { status: stage })
    notify(`Moved to ${STAGES.find(s => s.id === stage)?.label}`)
  }
}

// ---- detail drawer ----
const openId = ref<string | null>(null)
const lead = computed(() => leads.value.find(l => l.id === openId.value) || null)
const leadProposals = computed(() => (proposals.value || []).filter(p => p.leadId === openId.value))
function open(l: Lead) {
  openId.value = l.id
  if (!l.read) patch(l, { read: true })
}
const noteText = ref('')
function addNote() {
  if (!lead.value || !noteText.value.trim()) return
  const notes = [{ id: Math.random().toString(36).slice(2, 9), text: noteText.value.trim(), at: new Date().toISOString() }, ...(lead.value.notes || [])]
  patch(lead.value, { notes })
  noteText.value = ''
}
function removeNote(id: string) {
  if (lead.value) patch(lead.value, { notes: (lead.value.notes || []).filter(n => n.id !== id) })
}
async function remove(l: Lead) {
  if (!confirm(`Delete lead “${l.name}”? This cannot be undone.`)) return
  await $fetch(`/api/admin/collection/messages/${l.id}`, { method: 'DELETE' })
  openId.value = null
  await refresh()
}
const creating = ref(false)
async function createProposal(l: Lead) {
  creating.value = true
  try {
    const p = await $fetch<{ id: string }>('/api/admin/proposals', { method: 'POST', body: { leadId: l.id } })
    await navigateTo(`/admin/proposals/${p.id}`)
  }
  finally {
    creating.value = false
  }
}

function exportCsv() {
  const rows = [['Date', 'Name', 'Email', 'Stage', 'Value', 'Follow-up', 'Type', 'Message'],
    ...leads.value.map(m => [m.createdAt, m.name, m.email, stageOf(m), m.value ?? '', m.followUp ?? '', m.budget ?? '', m.message])]
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'leads.csv'
  a.click()
}
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const fmtDateTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
onMounted(() => refreshProposals())
</script>

<template>
  <div class="leads">
    <div class="head">
      <div>
        <h1>Leads</h1>
        <p>Drag cards between stages. Click a lead for notes, follow-ups and proposals.</p>
      </div>
      <div class="tools">
        <input v-model="q" class="input search" placeholder="Search leads…" aria-label="Search leads">
        <button v-if="leads.length" class="btn" @click="exportCsv"><Icon name="download" :size="16" /> CSV</button>
      </div>
    </div>

    <div class="board">
      <section
        v-for="col in columns" :key="col.id" class="col" :class="{ over: overCol === col.id }"
        @dragover.prevent="overCol = col.id" @dragleave="overCol = ''" @drop.prevent="drop(col.id)"
      >
        <header>
          <span class="dot" :style="{ background: col.color }" />
          <b>{{ col.label }}</b>
          <span class="count">{{ col.items.length }}</span>
          <span v-if="col.value" class="sum">{{ formatMoney(col.value, cur) }}</span>
        </header>
        <article
          v-for="l in col.items" :key="l.id" class="lead card" :class="{ unread: !l.read }" draggable="true"
          tabindex="0" @dragstart="dragId = l.id" @click="open(l)" @keydown.enter="open(l)"
        >
          <div class="top">
            <b>{{ l.name }}</b>
            <i v-if="!l.read" class="new" title="Unread" />
          </div>
          <span v-if="l.budget" class="tag">{{ l.budget }}</span>
          <p>{{ l.message }}</p>
          <div class="meta">
            <span>{{ fmtDate(l.createdAt) }}</span>
            <span v-if="fuState(l)" class="fu" :class="fuState(l)">
              <Icon name="star" :size="12" /> {{ fuState(l) === 'overdue' ? 'Overdue' : fuState(l) === 'today' ? 'Today' : fmtDate(l.followUp!) }}
            </span>
            <b v-if="l.value" class="val">{{ formatMoney(l.value, cur) }}</b>
          </div>
        </article>
        <p v-if="!col.items.length" class="empty">Drop leads here</p>
      </section>
    </div>

    <!-- detail drawer -->
    <Transition name="drawer">
      <div v-if="lead" class="overlay" @click.self="openId = null">
        <aside class="drawer">
          <header>
            <div>
              <h2>{{ lead.name }}</h2>
              <a :href="`mailto:${lead.email}`">{{ lead.email }}</a>
            </div>
            <button class="btn btn-sm" aria-label="Close" @click="openId = null"><Icon name="close" :size="16" /></button>
          </header>
          <div class="body">
            <div class="stages" role="radiogroup" aria-label="Stage">
              <button
                v-for="s in STAGES" :key="s.id" role="radio" :aria-checked="stageOf(lead) === s.id"
                :class="{ on: stageOf(lead) === s.id }" :style="{ '--c': s.color }" @click="patch(lead, { status: s.id })"
              >{{ s.label }}</button>
            </div>

            <section class="box">
              <small>{{ fmtDateTime(lead.createdAt) }}<template v-if="lead.budget"> · {{ lead.budget }}</template></small>
              <p class="msg">{{ lead.message }}</p>
            </section>

            <div class="two">
              <div class="field">
                <label for="ld-val">Deal value ({{ cur }})</label>
                <input id="ld-val" :value="lead.value ?? ''" type="number" min="0" class="input" placeholder="0" @change="patch(lead, { value: Number(($event.target as HTMLInputElement).value) || 0 })">
              </div>
              <div class="field">
                <label for="ld-fu">Follow up on</label>
                <input id="ld-fu" :value="lead.followUp || ''" type="date" class="input" @change="patch(lead, { followUp: ($event.target as HTMLInputElement).value })">
              </div>
            </div>
            <div class="quick">
              <span>Remind me:</span>
              <button class="chip" @click="patch(lead, { followUp: addDays(1) })">Tomorrow</button>
              <button class="chip" @click="patch(lead, { followUp: addDays(3) })">In 3 days</button>
              <button class="chip" @click="patch(lead, { followUp: addDays(7) })">Next week</button>
              <button v-if="lead.followUp" class="chip" @click="patch(lead, { followUp: '' })">Clear</button>
            </div>

            <section>
              <h3>Proposals</h3>
              <NuxtLink v-for="p in leadProposals" :key="p.id" :to="`/admin/proposals/${p.id}`" class="prop">
                <span>{{ p.title }}</span>
                <span class="pstatus" :class="p.status">{{ p.status }}</span>
                <b>{{ formatMoney(p.total, p.currency) }}</b>
              </NuxtLink>
              <button class="btn btn-primary btn-sm" :disabled="creating" @click="createProposal(lead)">
                <Icon name="plus" :size="16" /> {{ creating ? 'Creating…' : 'Create proposal' }}
              </button>
            </section>

            <section>
              <h3>Notes</h3>
              <form class="note-form" @submit.prevent="addNote">
                <textarea v-model="noteText" class="input" rows="2" placeholder="Call summary, requirements, next steps…" aria-label="New note" @keydown.ctrl.enter="addNote" />
                <button class="btn btn-sm" :disabled="!noteText.trim()">Add note</button>
              </form>
              <ul class="notes">
                <li v-for="n in lead.notes || []" :key="n.id">
                  <p>{{ n.text }}</p>
                  <small>{{ fmtDateTime(n.at) }} · <button class="link" @click="removeNote(n.id)">delete</button></small>
                </li>
              </ul>
            </section>
          </div>
          <footer>
            <a :href="`mailto:${lead.email}?subject=${encodeURIComponent('Re: your project enquiry')}`" class="btn"><Icon name="mail" :size="16" /> Email</a>
            <button class="btn btn-danger" @click="remove(lead)"><Icon name="trash" :size="16" /> Delete</button>
          </footer>
        </aside>
      </div>
    </Transition>
    <Transition name="toast"><div v-if="toast" class="toast"><Icon name="check" :size="16" /> {{ toast }}</div></Transition>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
h1 { font-size: 1.8rem; }
.head p { color: var(--muted); margin-top: 4px; }
.tools { display: flex; gap: 8px; }
.search { width: 220px; padding: 10px 14px; }
.board { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 10px; align-items: start; }
.col { background: rgba(255,255,255,.02); border: 1px solid var(--border); border-radius: 16px; padding: 10px; display: grid; gap: 8px; min-height: 200px; align-content: start; transition: border-color .2s, background .2s; }
.col.over { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); }
.col header { display: flex; align-items: center; gap: 8px; padding: 4px 6px 8px; font-size: .9rem; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.count { color: var(--faint); font-size: .8rem; }
.sum { margin-left: auto; font-size: .78rem; color: var(--muted); }
.lead { padding: 12px; display: grid; gap: 6px; cursor: grab; transition: transform .2s, border-color .2s; }
.lead:hover, .lead:focus-visible { border-color: var(--border-strong); transform: translateY(-2px); outline: none; }
.lead:active { cursor: grabbing; }
.lead.unread { border-color: color-mix(in srgb, var(--accent-2) 45%, transparent); }
.top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.new { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-2); }
.lead .tag { justify-self: start; font-size: .7rem; padding: 2px 8px; }
.lead p { color: var(--muted); font-size: .82rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { display: flex; align-items: center; gap: 8px; font-size: .75rem; color: var(--faint); flex-wrap: wrap; }
.fu { display: inline-flex; align-items: center; gap: 3px; padding: 1px 7px; border-radius: 99px; background: var(--surface-2); color: var(--muted); }
.fu.overdue { background: rgba(251,113,133,.15); color: #fb7185; }
.fu.today { background: rgba(251,191,36,.15); color: #fbbf24; }
.val { margin-left: auto; color: var(--text); }
.empty { color: var(--faint); font-size: .8rem; text-align: center; padding: 20px 0; border: 1px dashed var(--border); border-radius: 12px; }

.overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.55); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; }
.drawer { width: min(540px, 100%); height: 100%; background: var(--bg-2); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
.drawer > header, .drawer > footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 18px 22px; }
.drawer > header { border-bottom: 1px solid var(--border); align-items: flex-start; }
.drawer > header a { color: var(--accent-2); font-size: .9rem; }
.drawer > footer { border-top: 1px solid var(--border); }
.drawer h2 { font-size: 1.3rem; }
.drawer h3 { font-size: .95rem; margin-bottom: 10px; }
.body { flex: 1; overflow-y: auto; padding: 20px 22px; display: grid; gap: 22px; align-content: start; }
.stages { display: flex; flex-wrap: wrap; gap: 6px; }
.stages button { padding: 7px 12px; border-radius: 99px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-size: .82rem; }
.stages button.on { color: #05060f; background: var(--c); border-color: transparent; font-weight: 600; }
.box { padding: 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); display: grid; gap: 8px; }
.box small { color: var(--faint); }
.msg { white-space: pre-wrap; line-height: 1.6; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.quick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: .8rem; color: var(--muted); margin-top: -12px; }
.chip { padding: 4px 10px; border-radius: 99px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font-size: .78rem; }
.chip:hover { border-color: var(--accent); }
.prop { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 8px; font-size: .88rem; }
.prop:hover { border-color: var(--border-strong); }
.prop span:first-child { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pstatus { font-size: .72rem; padding: 2px 8px; border-radius: 99px; background: var(--surface-2); text-transform: capitalize; }
.pstatus.accepted { color: #34d399; } .pstatus.declined { color: #fb7185; } .pstatus.viewed, .pstatus.sent { color: #fbbf24; }
.note-form { display: grid; gap: 8px; justify-items: end; }
.notes { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 10px; }
.notes li { padding: 10px 12px; border-left: 2px solid var(--accent); background: var(--surface); border-radius: 0 10px 10px 0; }
.notes p { white-space: pre-wrap; font-size: .9rem; }
.notes small { color: var(--faint); font-size: .75rem; }
.link { background: none; border: 0; color: var(--danger); cursor: pointer; padding: 0; font-size: inherit; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 90; display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 99px; background: var(--bg-2); border: 1px solid var(--border-strong); color: var(--success); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .25s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .3s cubic-bezier(.2,.7,.2,1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
@media (max-width: 700px) { .search { width: 100%; } .tools { width: 100%; } .two { grid-template-columns: 1fr; } .board { grid-template-columns: repeat(5, 78vw); scroll-snap-type: x mandatory; } .col { scroll-snap-align: start; } }
</style>

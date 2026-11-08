<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: list } = await useFetch<any[]>('/api/admin/proposals', { headers: useRequestHeaders(['cookie']), default: () => [] })
const creating = ref(false)
async function create() {
  creating.value = true
  try {
    const p = await $fetch<{ id: string }>('/api/admin/proposals', { method: 'POST', body: {} })
    await navigateTo(`/admin/proposals/${p.id}`)
  }
  finally {
    creating.value = false
  }
}
const stats = computed(() => {
  const l = list.value || []
  return {
    open: l.filter(p => ['sent', 'viewed'].includes(p.status)).length,
    accepted: l.filter(p => p.status === 'accepted').length,
    acceptedValue: l.filter(p => p.status === 'accepted').reduce((a, p) => a + p.total, 0),
    currency: l[0]?.currency || '₹',
  }
})
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>Proposals</h1>
        <p>Branded quotes your clients can view and accept online. Tip: create them from a lead in <NuxtLink to="/admin/leads">Leads</NuxtLink>.</p>
      </div>
      <button class="btn btn-primary" :disabled="creating" @click="create"><Icon name="plus" :size="18" /> New proposal</button>
    </div>

    <div class="stats">
      <div class="card"><small>Awaiting reply</small><b>{{ stats.open }}</b></div>
      <div class="card"><small>Accepted</small><b>{{ stats.accepted }}</b></div>
      <div class="card"><small>Accepted value</small><b>{{ formatMoney(stats.acceptedValue, stats.currency) }}</b></div>
    </div>

    <div class="list">
      <NuxtLink v-for="p in list" :key="p.id" :to="`/admin/proposals/${p.id}`" class="row card">
        <div class="txt">
          <b>{{ p.title }}</b>
          <span>{{ p.clientName || 'No client yet' }}<template v-if="p.validUntil"> · valid until {{ formatDate(p.validUntil) }}</template></span>
        </div>
        <span class="pill" :class="p.status">{{ p.status }}</span>
        <b class="total">{{ formatMoney(p.total, p.currency) }}</b>
      </NuxtLink>
      <p v-if="!list.length" class="empty">No proposals yet.</p>
    </div>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
h1 { font-size: 1.8rem; }
.head p { color: var(--muted); margin-top: 4px; }
.head a { color: var(--accent-2); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 18px; }
.stats .card { padding: 16px 18px; display: grid; }
.stats small { color: var(--muted); }
.stats b { font-family: var(--font-head); font-size: 1.6rem; }
.list { display: grid; gap: 10px; }
.row { display: flex; align-items: center; gap: 14px; padding: 16px 18px; transition: border-color .2s; }
.row:hover { border-color: var(--border-strong); }
.txt { flex: 1; min-width: 0; display: grid; }
.txt span { color: var(--muted); font-size: .88rem; }
.total { font-family: var(--font-head); }
.pill { padding: 4px 10px; border-radius: 99px; font-size: .75rem; text-transform: capitalize; background: var(--surface-2); color: var(--muted); }
.pill.sent, .pill.viewed { color: #fbbf24; background: rgba(251,191,36,.12); }
.pill.accepted { color: #34d399; background: rgba(52,211,153,.12); }
.pill.declined { color: #fb7185; background: rgba(251,113,133,.12); }
.empty { color: var(--muted); padding: 24px 0; }
@media (max-width: 640px) { .stats { grid-template-columns: 1fr; } .row { flex-wrap: wrap; } }
</style>

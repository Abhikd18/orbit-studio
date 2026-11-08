<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const { data: items, refresh } = await useFetch<any[]>('/api/admin/collection/messages', { headers: useRequestHeaders(['cookie']), default: () => [] })
const selected = ref<any>(null)

async function open(m: any) {
  selected.value = m
  if (!m.read) {
    await $fetch(`/api/admin/collection/messages/${m.id}`, { method: 'PUT', body: { read: true } })
    m.read = true
  }
}
async function remove(m: any) {
  if (!confirm(`Delete message from ${m.name}?`)) return
  await $fetch(`/api/admin/collection/messages/${m.id}`, { method: 'DELETE' })
  selected.value = null
  await refresh()
}
function exportCsv() {
  const rows = [['Date', 'Name', 'Email', 'Type', 'Message'], ...items.value.map(m => [m.createdAt, m.name, m.email, m.budget, m.message])]
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'messages.csv'
  a.click()
}
const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>Messages</h1>
        <p>Leads from the website contact form.</p>
      </div>
      <button v-if="items.length" class="btn" @click="exportCsv"><Icon name="download" :size="18" /> Export CSV</button>
    </div>
    <div class="layout">
      <div class="list card">
        <button v-for="m in items" :key="m.id" class="item" :class="{ active: selected?.id === m.id, unread: !m.read }" @click="open(m)">
          <span class="avatar">{{ m.name[0]?.toUpperCase() }}</span>
          <span class="meta">
            <b>{{ m.name }}</b>
            <small>{{ m.message }}</small>
          </span>
          <i v-if="!m.read" class="dot" />
        </button>
        <p v-if="!items.length" class="empty">No messages yet.</p>
      </div>
      <div class="detail card">
        <template v-if="selected">
          <div class="dhead">
            <div>
              <h2>{{ selected.name }}</h2>
              <a :href="`mailto:${selected.email}`">{{ selected.email }}</a>
            </div>
            <span class="muted">{{ fmt(selected.createdAt) }}</span>
          </div>
          <span v-if="selected.budget" class="tag">{{ selected.budget }}</span>
          <p class="text">{{ selected.message }}</p>
          <div class="acts">
            <a :href="`mailto:${selected.email}?subject=Re: your project enquiry`" class="btn btn-primary"><Icon name="mail" :size="18" /> Reply by email</a>
            <button class="btn btn-danger" @click="remove(selected)"><Icon name="trash" :size="18" /> Delete</button>
          </div>
        </template>
        <p v-else class="empty">Select a message to read it.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
h1 { font-size: 1.8rem; }
.head p, .muted { color: var(--muted); }
.layout { display: grid; grid-template-columns: 340px 1fr; gap: 14px; min-height: 480px; }
.list { padding: 6px; overflow-y: auto; max-height: 70vh; }
.item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; border: 0; background: none; cursor: pointer; text-align: left; }
.item:hover { background: var(--surface); }
.item.active { background: color-mix(in srgb, var(--accent) 18%, transparent); }
.meta { flex: 1; min-width: 0; display: grid; }
.meta small { color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.unread b { color: #fff; }
.avatar { width: 38px; height: 38px; border-radius: 50%; flex: none; display: grid; place-items: center; background: var(--grad); font-weight: 700; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent-2); }
.detail { padding: 26px; display: grid; gap: 18px; align-content: start; }
.dhead { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.dhead a { color: var(--accent-2); }
.text { white-space: pre-wrap; line-height: 1.7; }
.acts { display: flex; gap: 10px; flex-wrap: wrap; }
.empty { color: var(--muted); padding: 24px; text-align: center; }
@media (max-width: 860px) { .layout { grid-template-columns: 1fr; } .list { max-height: 320px; } }
</style>

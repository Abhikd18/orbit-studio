<script setup lang="ts">
/**
 * Generic CRUD screen. Pass a collection name and a field schema and you get
 * a list + create/edit drawer + delete — reused for projects, services, testimonials.
 */
export interface Field {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'toggle' | 'tags' | 'gradient' | 'url' | 'date' | 'datetime'
  options?: string[]
  placeholder?: string
  required?: boolean
}
const props = defineProps<{
  collection: string
  title: string
  description: string
  fields: Field[]
  titleKey: string
  subtitleKey?: string
  defaults: Record<string, any>
  viewBase?: string
}>()

const headers = useRequestHeaders(['cookie'])
const { data: items, refresh } = await useFetch<any[]>(`/api/admin/collection/${props.collection}`, { headers, default: () => [] })

const editing = ref<Record<string, any> | null>(null)
const saving = ref(false)
const error = ref('')
const toast = ref('')

// ISO <-> <input type="datetime-local"> (browser's local time)
const toLocalInput = (iso?: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const dtKeys = computed(() => props.fields.filter(f => f.type === 'datetime').map(f => f.key))
const isScheduled = (item: any) => !!item.publishAt && new Date(item.publishAt).getTime() > Date.now()
const fmtWhen = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

// newest / latest-scheduled first when items have dates
const sorted = computed(() => {
  const list = items.value || []
  if (!list.some(i => i.publishAt || i.date)) return list
  return [...list].sort((a, b) => String(b.publishAt || b.date || '').localeCompare(String(a.publishAt || a.date || '')))
})

function openNew() {
  editing.value = structuredClone({ ...props.defaults })
  error.value = ''
}
function openEdit(item: any) {
  editing.value = structuredClone(toRaw(item))
  if (Array.isArray(editing.value!.tags)) editing.value!.tagsText = editing.value!.tags.join(', ')
  for (const k of dtKeys.value) editing.value![k] = toLocalInput(editing.value![k])
  error.value = ''
}
function notify(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2200)
}

async function save() {
  if (!editing.value) return
  saving.value = true
  error.value = ''
  const body: Record<string, any> = { ...editing.value }
  if ('tagsText' in body) {
    body.tags = String(body.tagsText).split(',').map(t => t.trim()).filter(Boolean)
    delete body.tagsText
  }
  for (const k of dtKeys.value) body[k] = body[k] ? new Date(body[k]).toISOString() : ''
  try {
    if (body.id) await $fetch(`/api/admin/collection/${props.collection}/${body.id}`, { method: 'PUT', body })
    else await $fetch(`/api/admin/collection/${props.collection}`, { method: 'POST', body })
    await refresh()
    refreshNuxtData('content')
    editing.value = null
    notify('Saved — live on the website')
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Save failed'
  }
  finally {
    saving.value = false
  }
}

async function remove(item: any) {
  if (!confirm(`Delete “${item[props.titleKey]}”? This cannot be undone.`)) return
  await $fetch(`/api/admin/collection/${props.collection}/${item.id}`, { method: 'DELETE' })
  await refresh()
  notify('Deleted')
}

async function togglePublished(item: any) {
  await $fetch(`/api/admin/collection/${props.collection}/${item.id}`, { method: 'PUT', body: { published: !item.published } })
  await refresh()
}

const gradients = [
  'linear-gradient(135deg,#7c5cff,#22d3ee)',
  'linear-gradient(135deg,#f472b6,#7c5cff)',
  'linear-gradient(135deg,#22d3ee,#34d399)',
  'linear-gradient(135deg,#fbbf24,#f472b6)',
  'linear-gradient(135deg,#fb7185,#fbbf24)',
  'linear-gradient(135deg,#6366f1,#0ea5e9)',
]
const hasPublished = computed(() => props.fields.some(f => f.key === 'published'))
</script>

<template>
  <div class="coll">
    <div class="head">
      <div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <button class="btn btn-primary" @click="openNew"><Icon name="plus" :size="18" /> Add new</button>
    </div>

    <div class="list">
      <div v-for="item in sorted" :key="item.id" class="row card">
        <span v-if="item.gradient || item.cover" class="sw" :style="{ background: item.gradient || item.cover }" />
        <span v-else-if="item.icon" class="sw icon"><Icon :name="item.icon" :size="18" /></span>
        <div class="txt">
          <b>{{ item[titleKey] }}</b>
          <span v-if="subtitleKey">{{ item[subtitleKey] }}</span>
        </div>
        <button v-if="hasPublished" class="pill" :class="{ on: item.published && !isScheduled(item), sched: item.published && isScheduled(item) }" :title="item.published ? 'Click to unpublish' : 'Click to publish'" @click="togglePublished(item)">
          {{ !item.published ? 'Draft' : isScheduled(item) ? `Scheduled · ${fmtWhen(item.publishAt)}` : 'Published' }}
        </button>
        <div class="actions">
          <NuxtLink v-if="item.slug && item.published && !isScheduled(item)" :to="`${viewBase || '/projects'}/${item.slug}`" target="_blank" class="btn btn-sm" title="View"><Icon name="eye" :size="16" /></NuxtLink>
          <button class="btn btn-sm" title="Edit" @click="openEdit(item)"><Icon name="edit" :size="16" /></button>
          <button class="btn btn-sm btn-danger" title="Delete" @click="remove(item)"><Icon name="trash" :size="16" /></button>
        </div>
      </div>
      <p v-if="!items?.length" class="empty">Nothing here yet. Click “Add new”.</p>
    </div>

    <Transition name="drawer">
      <div v-if="editing" class="overlay" @click.self="editing = null">
        <form class="drawer" @submit.prevent="save">
          <header>
            <h2>{{ editing.id ? 'Edit' : 'New' }} {{ title.replace(/s$/, '').toLowerCase() }}</h2>
            <button type="button" class="btn btn-sm" aria-label="Close" @click="editing = null"><Icon name="close" :size="16" /></button>
          </header>
          <div class="fields">
            <div v-for="f in fields" :key="f.key" class="field">
              <label :for="`f-${f.key}`">{{ f.label }}</label>
              <textarea v-if="f.type === 'textarea'" :id="`f-${f.key}`" v-model="editing[f.key]" class="input" :placeholder="f.placeholder" :required="f.required" rows="6" />
              <select v-else-if="f.type === 'select'" :id="`f-${f.key}`" v-model="editing[f.key]" class="input">
                <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
              </select>
              <label v-else-if="f.type === 'toggle'" class="switch">
                <input :id="`f-${f.key}`" v-model="editing[f.key]" type="checkbox">
                <span class="knob" />
                <span>{{ editing[f.key] ? 'Yes' : 'No' }}</span>
              </label>
              <input v-else-if="f.type === 'tags'" :id="`f-${f.key}`" v-model="editing.tagsText" class="input" :placeholder="f.placeholder || 'Comma, separated, tags'">
              <div v-else-if="f.type === 'gradient'" class="grads">
                <button v-for="g in gradients" :key="g" type="button" class="g" :class="{ on: editing[f.key] === g }" :style="{ background: g }" :aria-label="g" @click="editing[f.key] = g" />
              </div>
              <input v-else :id="`f-${f.key}`" v-model="editing[f.key]" class="input" :type="f.type === 'url' ? 'url' : f.type === 'date' ? 'date' : f.type === 'datetime' ? 'datetime-local' : 'text'" :placeholder="f.placeholder" :required="f.required">
            </div>
          </div>
          <p v-if="error" class="err">{{ error }}</p>
          <footer>
            <button type="button" class="btn" @click="editing = null">Cancel</button>
            <button class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
          </footer>
        </form>
      </div>
    </Transition>

    <Transition name="toast"><div v-if="toast" class="toast"><Icon name="check" :size="16" /> {{ toast }}</div></Transition>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }
h1 { font-size: 1.8rem; }
.head p { color: var(--muted); margin-top: 4px; }
.list { display: grid; gap: 10px; }
.row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; }
.sw { width: 44px; height: 44px; border-radius: 12px; flex: none; }
.sw.icon { display: grid; place-items: center; background: color-mix(in srgb, var(--accent) 22%, transparent); }
.txt { flex: 1; min-width: 0; display: grid; }
.txt span { color: var(--muted); font-size: .88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pill { padding: 5px 12px; border-radius: 99px; font-size: .78rem; cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--muted); }
.pill.sched { color: #fbbf24; border-color: rgba(251,191,36,.4); background: rgba(251,191,36,.08); }
.pill.on { color: var(--success); border-color: color-mix(in srgb, var(--success) 40%, transparent); background: color-mix(in srgb, var(--success) 10%, transparent); }
.actions { display: flex; gap: 6px; }
.actions .btn { padding: 8px 10px; }
.empty { color: var(--muted); padding: 30px 0; }
.overlay { position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,.55); backdrop-filter: blur(4px); display: flex; justify-content: flex-end; }
.drawer { width: min(520px, 100%); height: 100%; background: var(--bg-2); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
.drawer header, .drawer footer { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; gap: 10px; }
.drawer header { border-bottom: 1px solid var(--border); }
.drawer footer { border-top: 1px solid var(--border); justify-content: flex-end; }
.drawer h2 { font-size: 1.2rem; }
.fields { flex: 1; overflow-y: auto; padding: 22px; display: grid; gap: 18px; align-content: start; }
.err { color: var(--danger); padding: 0 22px; }
.switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; color: var(--text) !important; }
.switch input { position: absolute; opacity: 0; }
.knob { width: 42px; height: 24px; border-radius: 99px; background: var(--surface-2); border: 1px solid var(--border-strong); position: relative; transition: background .2s; }
.knob::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; }
.switch input:checked + .knob { background: var(--accent); }
.switch input:checked + .knob::after { transform: translateX(18px); }
.switch input:focus-visible + .knob { outline: 2px solid var(--accent-2); outline-offset: 2px; }
.grads { display: flex; flex-wrap: wrap; gap: 10px; }
.g { width: 44px; height: 44px; border-radius: 12px; border: 2px solid transparent; cursor: pointer; }
.g.on { border-color: #fff; box-shadow: 0 0 0 3px var(--bg-2), 0 0 0 5px var(--accent); }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 90; display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 99px; background: var(--bg-2); border: 1px solid var(--border-strong); box-shadow: 0 20px 50px rgba(0,0,0,.5); color: var(--success); }
.drawer-enter-active, .drawer-leave-active { transition: opacity .25s; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .3s cubic-bezier(.2,.7,.2,1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
@media (max-width: 600px) { .row { flex-wrap: wrap; } .txt { flex-basis: calc(100% - 60px); } }
</style>

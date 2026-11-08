<script setup lang="ts">
// Multiple screenshots for a project: upload several at once, reorder, remove.
const model = defineModel<string[]>({ default: () => [] })
const props = withDefaults(defineProps<{ folder?: string, max?: number }>(), { folder: 'uploads', max: 20 })
const input = ref<HTMLInputElement>()
const busy = ref(0)
const error = ref('')
const list = computed(() => (Array.isArray(model.value) ? model.value : []))

async function add(files?: FileList | null) {
  if (!files?.length) return
  error.value = ''
  const room = props.max - list.value.length
  const picked = [...files].slice(0, Math.max(0, room))
  if (picked.length < files.length) error.value = `Maximum ${props.max} images`
  busy.value = picked.length
  for (const f of picked) {
    try {
      const url = await uploadImage(f, props.folder)
      model.value = [...list.value, url]
    }
    catch (e: any) {
      error.value = e?.data?.statusMessage || e?.message || 'Upload failed'
    }
    finally {
      busy.value--
    }
  }
  if (input.value) input.value.value = ''
}
const remove = (i: number) => (model.value = list.value.filter((_, j) => j !== i))
function move(i: number, dir: -1 | 1) {
  const next = [...list.value]
  const j = i + dir
  if (j < 0 || j >= next.length) return
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  model.value = next
}
</script>

<template>
  <div class="gallery">
    <div class="grid">
      <figure v-for="(url, i) in list" :key="url" class="thumb">
        <img :src="url" alt="">
        <figcaption>
          <button type="button" :disabled="i === 0" aria-label="Move left" @click="move(i, -1)">‹</button>
          <span>{{ i + 1 }}</span>
          <button type="button" :disabled="i === list.length - 1" aria-label="Move right" @click="move(i, 1)">›</button>
          <button type="button" class="del" aria-label="Remove" @click="remove(i)"><Icon name="trash" :size="13" /></button>
        </figcaption>
      </figure>
      <button type="button" class="addbtn" :disabled="busy > 0 || list.length >= max" @click="input?.click()" @dragover.prevent @drop.prevent="add($event.dataTransfer?.files)">
        <Icon :name="busy ? 'cloud' : 'plus'" :size="20" />
        <span>{{ busy ? `Uploading ${busy}…` : 'Add screenshots' }}</span>
      </button>
    </div>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" multiple hidden @change="add(($event.target as HTMLInputElement).files)">
    <p v-if="error" class="err">{{ error }}</p>
  </div>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.thumb { margin: 0; position: relative; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--surface); }
.thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
figcaption { position: absolute; inset: auto 0 0; display: flex; align-items: center; gap: 4px; padding: 4px; background: linear-gradient(transparent, rgba(0,0,0,.75)); font-size: .72rem; }
figcaption span { flex: 1; text-align: center; }
figcaption button { width: 24px; height: 24px; border-radius: 6px; border: 0; background: rgba(255,255,255,.15); color: #fff; cursor: pointer; display: grid; place-items: center; }
figcaption button:disabled { opacity: .3; cursor: default; }
figcaption .del { background: rgba(251,113,133,.35); }
.addbtn { aspect-ratio: 16 / 10; border-radius: 10px; border: 1.5px dashed var(--border-strong); background: var(--surface); color: var(--muted); cursor: pointer; display: grid; place-items: center; align-content: center; gap: 4px; font-size: .8rem; }
.addbtn:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.err { color: var(--danger); font-size: .85rem; margin-top: 6px; }
</style>

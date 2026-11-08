<script setup lang="ts">
/**
 * Image picker for the admin: compresses in the browser (max 1920px, WebP),
 * uploads to /api/admin/upload and returns the public URL via v-model.
 */
const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{ folder?: string, aspect?: string, round?: boolean }>(), { folder: 'uploads', aspect: '16 / 9' })
const input = ref<HTMLInputElement>()
const busy = ref(false)
const error = ref('')
const dragging = ref(false)

async function upload(file?: File | null) {
  if (!file) return
  error.value = ''
  if (!file.type.startsWith('image/')) return (error.value = 'Please choose an image file')
  busy.value = true
  try {
    model.value = await uploadImage(file, props.folder)
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Upload failed'
  }
  finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}
const onDrop = (e: DragEvent) => {
  dragging.value = false
  upload(e.dataTransfer?.files?.[0])
}
</script>

<template>
  <div class="imgfield">
    <div
      class="drop" :class="{ dragging, round, has: !!model }" :style="{ aspectRatio: round ? '1' : aspect }"
      role="button" tabindex="0" :aria-label="model ? 'Replace image' : 'Upload image'"
      @click="input?.click()" @keydown.enter.prevent="input?.click()" @keydown.space.prevent="input?.click()"
      @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"
    >
      <img v-if="model" :src="model" alt="">
      <div v-if="!model || busy" class="hint">
        <Icon :name="busy ? 'cloud' : 'plus'" :size="22" />
        <span>{{ busy ? 'Uploading…' : 'Click or drop an image' }}</span>
      </div>
    </div>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" hidden @change="upload(($event.target as HTMLInputElement).files?.[0])">
    <div class="row">
      <span v-if="error" class="err">{{ error }}</span>
      <button v-if="model && !busy" type="button" class="btn btn-sm btn-danger" @click="model = ''"><Icon name="trash" :size="14" /> Remove</button>
    </div>
  </div>
</template>

<style scoped>
.imgfield { display: grid; gap: 8px; }
.drop { position: relative; width: 100%; border-radius: 14px; border: 1.5px dashed var(--border-strong); background: var(--surface); overflow: hidden; cursor: pointer; display: grid; place-items: center; transition: border-color .2s, background .2s; }
.drop.round { width: 120px; border-radius: 50%; }
.drop:hover, .drop.dragging, .drop:focus-visible { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent); outline: none; }
.drop.has { border-style: solid; }
img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hint { position: relative; display: grid; justify-items: center; gap: 6px; color: var(--muted); font-size: .85rem; text-align: center; padding: 10px; }
.drop.has .hint { background: rgba(5,6,15,.7); border-radius: 10px; color: var(--text); }
.row { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 0; }
.row:empty { display: none; }
.err { color: var(--danger); font-size: .85rem; }
</style>

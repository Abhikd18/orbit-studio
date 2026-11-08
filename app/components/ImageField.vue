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

async function compress(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file // keep animations
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1920 / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', 0.86))
  return blob && blob.size < file.size ? blob : file
}

async function upload(file?: File | null) {
  if (!file) return
  error.value = ''
  if (!file.type.startsWith('image/')) return (error.value = 'Please choose an image file')
  busy.value = true
  try {
    const blob = await compress(file)
    const fd = new FormData()
    fd.append('file', blob, file.name)
    const res = await $fetch<{ url: string }>(`/api/admin/upload?folder=${props.folder}`, { method: 'POST', body: fd })
    model.value = res.url
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

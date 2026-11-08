/** Compresses an image in the browser (max 1920px, WebP) and uploads it via the admin API. */
export async function compressImage(file: File): Promise<Blob> {
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

export async function uploadImage(file: File, folder = 'uploads'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  const fd = new FormData()
  fd.append('file', await compressImage(file), file.name)
  const res = await $fetch<{ url: string }>(`/api/admin/upload?folder=${folder}`, { method: 'POST', body: fd })
  return res.url
}

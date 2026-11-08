<script setup lang="ts">
const props = withDefaults(defineProps<{ name: string, size?: number }>(), { size: 22 })
const paths: Record<string, string> = {
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c2.8 2.7 4.2 6 4.2 10s-1.4 7.3-4.2 10m0-20C9.2 4.7 7.8 8 7.8 12s1.4 7.3 4.2 10M2.5 9h19M2.5 15h19',
  phone: 'M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h2',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  spark: 'M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3.5 3.5m7 7L19 19M5 19l3.5-3.5m7-7L19 5',
  cloud: 'M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5H7Z',
  cart: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6m4 13h.01M17 21h.01',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  arrowLeft: 'M19 12H5m6 6-6-6 6-6',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12 5 5 9-10',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  folder: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z',
  star: 'm12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9L12 3Z',
  inbox: 'M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6l2-8Z',
  cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  plus: 'M12 5v14M5 12h14',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 3v12m-5-5 5 5 5-5M4 21h16',
  db: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Zm8 3v12c0 1.7-3.6 3-8 3s-8-1.3-8-3V6m16 6c0 1.7-3.6 3-8 3s-8-1.3-8-3',
  git: 'M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c0 5-6 4-12 6',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  external: 'M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
}
const d = computed(() => paths[props.name] || paths.spark)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="d" />
  </svg>
</template>

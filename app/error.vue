<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="err">
    <BgFx />
    <div class="box">
      <b class="code grad-text">{{ props.error.statusCode }}</b>
      <h1>{{ props.error.statusCode === 404 ? 'Lost in orbit' : 'Something went wrong' }}</h1>
      <p>{{ props.error.statusCode === 404 ? 'This page drifted out of range.' : props.error.statusMessage }}</p>
      <button class="btn btn-primary" @click="clearError({ redirect: '/' })">Back to home</button>
    </div>
  </div>
</template>

<style scoped>
.err { min-height: 100vh; display: grid; place-items: center; padding: 20px; text-align: center; }
.box { display: grid; gap: 14px; justify-items: center; }
.code { font-family: var(--font-head); font-size: clamp(5rem, 18vw, 9rem); font-weight: 700; line-height: 1; }
p { color: var(--muted); }
.btn { margin-top: 10px; }
</style>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Reset password', meta: [{ name: 'robots', content: 'noindex' }] })
const email = ref('')
const state = ref<'idle' | 'sending' | 'sent'>('idle')
const message = ref('')
const error = ref('')
async function submit() {
  state.value = 'sending'
  error.value = ''
  try {
    const res = await $fetch<{ message: string }>('/api/admin/forgot', { method: 'POST', body: { email: email.value } })
    message.value = res.message
    state.value = 'sent'
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Something went wrong'
    state.value = 'idle'
  }
}
</script>

<template>
  <div class="wrap">
    <BgFx />
    <form class="box card" @submit.prevent="submit">
      <span class="mark" />
      <h1>Forgot password</h1>
      <template v-if="state !== 'sent'">
        <p>Enter the admin email address. We’ll send you a link to choose a new password.</p>
        <div class="field">
          <label for="em">Admin email</label>
          <input id="em" v-model="email" type="email" class="input" autocomplete="email" required autofocus>
        </div>
        <p v-if="error" class="err">{{ error }}</p>
        <button class="btn btn-primary" :disabled="state === 'sending'">{{ state === 'sending' ? 'Sending…' : 'Send reset link' }}</button>
      </template>
      <p v-else class="ok"><Icon name="mail" :size="18" /> {{ message }}</p>
      <details class="help">
        <summary>No access to that email?</summary>
        <p>The site owner can set a new password in Vercel: Project → Settings → Environment Variables → change <code>NUXT_ADMIN_PASSWORD</code>, then redeploy. The new value works immediately and replaces the old password.</p>
      </details>
      <NuxtLink to="/admin/login" class="back">← Back to login</NuxtLink>
    </form>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.box { width: 100%; max-width: 420px; padding: 36px; display: grid; gap: 16px; }
.mark { width: 44px; height: 44px; border-radius: 50%; background: var(--grad); box-shadow: 0 0 40px var(--accent); }
h1 { font-size: 1.7rem; }
p { color: var(--muted); }
.ok { display: flex; gap: 10px; align-items: flex-start; color: var(--success); }
.err { color: var(--danger); font-size: .9rem; }
.help { font-size: .85rem; color: var(--muted); }
.help summary { cursor: pointer; }
.help p { margin-top: 8px; font-size: .85rem; }
code { color: var(--accent-2); }
.back { color: var(--muted); font-size: .88rem; text-align: center; }
</style>

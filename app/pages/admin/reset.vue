<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Choose a new password', meta: [{ name: 'robots', content: 'noindex' }, { name: 'referrer', content: 'no-referrer' }] })
const route = useRoute()
const token = computed(() => String(route.query.token || ''))
const pw = ref('')
const pw2 = ref('')
const error = ref('')
const loading = ref(false)
async function submit() {
  error.value = ''
  if (pw.value !== pw2.value) return (error.value = 'Passwords do not match')
  loading.value = true
  try {
    await $fetch('/api/admin/reset', { method: 'POST', body: { token: token.value, password: pw.value } })
    await navigateTo('/admin')
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Reset failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <BgFx />
    <form class="box card" @submit.prevent="submit">
      <span class="mark" />
      <h1>Choose a new password</h1>
      <p v-if="!token" class="err">This link is missing its token. Request a new reset email.</p>
      <template v-else>
        <div class="field">
          <label for="pw">New password (min. 8 characters)</label>
          <input id="pw" v-model="pw" type="password" class="input" autocomplete="new-password" minlength="8" required autofocus>
        </div>
        <div class="field">
          <label for="pw2">Repeat new password</label>
          <input id="pw2" v-model="pw2" type="password" class="input" autocomplete="new-password" minlength="8" required>
        </div>
        <p v-if="error" class="err">{{ error }}</p>
        <button class="btn btn-primary" :disabled="loading">{{ loading ? 'Saving…' : 'Save and sign in' }}</button>
      </template>
      <NuxtLink to="/admin/forgot" class="back">Request a new link</NuxtLink>
    </form>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.box { width: 100%; max-width: 420px; padding: 36px; display: grid; gap: 16px; }
.mark { width: 44px; height: 44px; border-radius: 50%; background: var(--grad); box-shadow: 0 0 40px var(--accent); }
h1 { font-size: 1.7rem; }
.err { color: var(--danger); font-size: .9rem; }
.back { color: var(--muted); font-size: .88rem; text-align: center; }
</style>

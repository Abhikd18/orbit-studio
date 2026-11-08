<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Admin login', meta: [{ name: 'robots', content: 'noindex' }] })
const route = useRoute()
const password = ref('')
const error = ref('')
const loading = ref(false)
async function login() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    const next = String(route.query.next || '/admin')
    await navigateTo(next.startsWith('/admin') ? next : '/admin')
  }
  catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login failed'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <BgFx />
    <form class="box card" @submit.prevent="login">
      <span class="mark" />
      <h1>Admin dashboard</h1>
      <p>Sign in to manage your website content.</p>
      <div class="field">
        <label for="pw">Password</label>
        <input id="pw" v-model="password" type="password" class="input" autocomplete="current-password" required autofocus>
      </div>
      <p v-if="error" class="err">{{ error }}</p>
      <button class="btn btn-primary" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
      <div class="links">
        <NuxtLink to="/admin/forgot">Forgot password?</NuxtLink>
        <NuxtLink to="/">← Back to website</NuxtLink>
      </div>
    </form>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.box { width: 100%; max-width: 400px; padding: 36px; display: grid; gap: 16px; }
.mark { width: 44px; height: 44px; border-radius: 50%; background: var(--grad); box-shadow: 0 0 40px var(--accent); }
h1 { font-size: 1.7rem; }
p { color: var(--muted); }
.err { color: var(--danger); font-size: .9rem; }
.links { display: flex; justify-content: space-between; gap: 10px; font-size: .88rem; }
.links a { color: var(--muted); }
.links a:hover { color: var(--text); }
</style>

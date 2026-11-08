<script setup lang="ts">
const current = ref('')
const next = ref('')
const next2 = ref('')
const msg = ref('')
const err = ref('')
const saving = ref(false)
const { data: me } = await useFetch<{ emailReset: boolean }>('/api/admin/me', { headers: useRequestHeaders(['cookie']) })

async function save() {
  msg.value = err.value = ''
  if (next.value !== next2.value) return (err.value = 'New passwords do not match')
  saving.value = true
  try {
    await $fetch('/api/admin/password', { method: 'PUT', body: { current: current.value, next: next.value } })
    current.value = next.value = next2.value = ''
    msg.value = 'Password changed. Other devices have been logged out.'
  }
  catch (e: any) {
    err.value = e?.data?.statusMessage || 'Could not change password'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="card group" @submit.prevent="save">
    <h2>Change password</h2>
    <div class="grid">
      <div class="field"><label for="cp">Current password</label><input id="cp" v-model="current" type="password" class="input" autocomplete="current-password" required></div>
      <div class="field"><label for="np">New password (min. 8)</label><input id="np" v-model="next" type="password" class="input" autocomplete="new-password" minlength="8" required></div>
      <div class="field"><label for="np2">Repeat new password</label><input id="np2" v-model="next2" type="password" class="input" autocomplete="new-password" minlength="8" required></div>
    </div>
    <p v-if="msg" class="ok"><Icon name="check" :size="16" /> {{ msg }}</p>
    <p v-if="err" class="err">{{ err }}</p>
    <div class="foot">
      <p class="hint">
        Password reset by email:
        <b :class="me?.emailReset ? 'on' : 'off'">{{ me?.emailReset ? 'enabled' : 'not set up yet' }}</b>
      </p>
      <button class="btn" :disabled="saving">{{ saving ? 'Saving…' : 'Update password' }}</button>
    </div>
  </form>
</template>

<style scoped>
.group { padding: 24px; display: grid; gap: 16px; }
.group h2 { font-size: 1.1rem; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.hint { color: var(--muted); font-size: .88rem; }
.on { color: var(--success); }
.off { color: #fbbf24; }
.ok { color: var(--success); display: flex; gap: 8px; align-items: center; }
.err { color: var(--danger); }
@media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
</style>

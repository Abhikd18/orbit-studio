<script setup lang="ts">
const form = reactive({ name: '', email: '', budget: '', message: '' })
const state = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const error = ref('')

async function submit() {
  state.value = 'sending'
  error.value = ''
  try {
    await $fetch('/api/contact', { method: 'POST', body: form, baseURL: useApiBase() })
    state.value = 'sent'
    Object.assign(form, { name: '', email: '', budget: '', message: '' })
  }
  catch (e: any) {
    state.value = 'error'
    error.value = e?.data?.statusMessage || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <form class="form card" @submit.prevent="submit">
    <Transition name="fade" mode="out-in">
      <div v-if="state === 'sent'" class="sent">
        <div class="check"><Icon name="check" :size="30" /></div>
        <h3>Message received</h3>
        <p>Thanks — we usually reply within 24 hours.</p>
        <button type="button" class="btn" @click="state = 'idle'">Send another</button>
      </div>
      <div v-else class="fields">
        <div class="row">
          <div class="field">
            <label for="cf-name">Your name</label>
            <input id="cf-name" v-model="form.name" class="input" required autocomplete="name" placeholder="Jane Doe">
          </div>
          <div class="field">
            <label for="cf-email">Email</label>
            <input id="cf-email" v-model="form.email" class="input" type="email" required autocomplete="email" placeholder="jane@company.com">
          </div>
        </div>
        <div class="field">
          <label for="cf-budget">Project type</label>
          <select id="cf-budget" v-model="form.budget" class="input">
            <option value="">Select…</option>
            <option>Website</option>
            <option>Mobile app</option>
            <option>Website + mobile app</option>
            <option>Admin dashboard / CMS</option>
            <option>E-commerce</option>
            <option>Something else</option>
          </select>
        </div>
        <div class="field">
          <label for="cf-msg">Tell us about your project</label>
          <textarea id="cf-msg" v-model="form.message" class="input" required placeholder="Goals, timeline, links…" />
        </div>
        <p v-if="error" class="err">{{ error }}</p>
        <button class="btn btn-primary" :disabled="state === 'sending'">
          {{ state === 'sending' ? 'Sending…' : 'Send message' }}
          <Icon name="arrow" :size="18" />
        </button>
        <p class="note">Submissions go straight to the admin dashboard inbox.</p>
      </div>
    </Transition>
  </form>
</template>

<style scoped>
.form { padding: 30px; }
.fields { display: grid; gap: 18px; }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.err { color: var(--danger); font-size: .9rem; }
.note { color: var(--faint); font-size: .8rem; text-align: center; }
.sent { text-align: center; display: grid; justify-items: center; gap: 12px; padding: 40px 0; }
.sent p { color: var(--muted); }
.check { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: var(--grad); box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 60%, transparent); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 600px) { .row { grid-template-columns: 1fr; } .form { padding: 22px; } }
</style>

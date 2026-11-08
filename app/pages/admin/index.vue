<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
const NuxtLink = resolveComponent('NuxtLink')
const { data } = await useFetch<any>('/api/admin/overview', { headers: useRequestHeaders(['cookie']) })
const max = computed(() => Math.max(1, ...(data.value?.days || []).map((d: any) => d.count)))
const cards = computed(() => {
  const c = data.value?.counts || {}
  return [
    { label: 'Total page views', value: c.totalViews, icon: 'eye' },
    { label: 'Leads', value: c.messages, sub: `${c.unread || 0} unread`, icon: 'inbox', to: '/admin/leads' },
    { label: 'Projects', value: c.projects, icon: 'folder', to: '/admin/projects' },
    { label: 'Services', value: c.services, icon: 'spark', to: '/admin/services' },
  ]
})
const stages = [
  { id: 'new', label: 'New', color: '#22d3ee' },
  { id: 'contacted', label: 'Contacted', color: '#a78bfa' },
  { id: 'proposal', label: 'Proposal', color: '#fbbf24' },
  { id: 'won', label: 'Won', color: '#34d399' },
  { id: 'lost', label: 'Lost', color: '#fb7185' },
]
const fmtDay = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
</script>

<template>
  <div v-if="data" class="ov">
    <div class="hello">
      <h1>Welcome back 👋</h1>
      <p>Here’s what’s happening on your website.</p>
    </div>

    <div v-if="!data.persistent" class="warn card">
      <Icon name="db" />
      <div>
        <b>Database: {{ data.database }}</b>
        <p>Changes are temporary. Connect the free <b>Upstash Redis</b> integration in Vercel → Storage to make them permanent (see README).</p>
      </div>
    </div>

    <div class="cards">
      <component :is="c.to ? NuxtLink : 'div'" v-for="c in cards" :key="c.label" :to="c.to" class="stat card card-glow">
        <span class="ic"><Icon :name="c.icon" :size="18" /></span>
        <small>{{ c.label }}</small>
        <b>{{ c.value ?? 0 }}</b>
        <span v-if="c.sub" class="sub">{{ c.sub }}</span>
      </component>
    </div>

    <div class="row">
      <section class="panel card">
        <header><h2>Sales pipeline</h2><NuxtLink to="/admin/leads" class="btn btn-sm">Open board</NuxtLink></header>
        <div class="pipe">
          <NuxtLink v-for="s in stages" :key="s.id" to="/admin/leads" class="stage">
            <i :style="{ background: s.color }" />
            <span>{{ s.label }}</span>
            <b>{{ data.pipeline[s.id] || 0 }}</b>
          </NuxtLink>
        </div>
        <div class="money">
          <div><small>Open pipeline</small><b>{{ formatMoney(data.openValue, data.currency) }}</b></div>
          <div><small>Won</small><b class="won">{{ formatMoney(data.wonValue, data.currency) }}</b></div>
          <div><small>Proposals awaiting reply</small><b>{{ data.proposalsOpen }}</b></div>
        </div>
      </section>
      <section class="panel card">
        <header><h2>Follow-ups due</h2></header>
        <ul v-if="data.followUps.length" class="fus">
          <li v-for="f in data.followUps" :key="f.id">
            <NuxtLink to="/admin/leads">{{ f.name }}</NuxtLink>
            <span :class="{ overdue: f.overdue }">{{ f.overdue ? `overdue · ${f.followUp}` : 'today' }}</span>
          </li>
        </ul>
        <p v-else class="muted">Nothing due. Set follow-up dates on leads to get reminders here and by email.</p>
      </section>
    </div>

    <div class="row">
      <section class="panel card">
        <header><h2>Page views</h2><span class="muted">Last 14 days</span></header>
        <div class="chart" role="img" :aria-label="`Page views over the last 14 days, peak ${max}`">
          <div v-for="d in data.days" :key="d.day" class="bar-col">
            <div class="bar" :style="{ height: `${(d.count / max) * 100}%` }" :title="`${fmtDay(d.day)}: ${d.count} views`">
              <span v-if="d.count" class="val">{{ d.count }}</span>
            </div>
            <span class="lbl">{{ fmtDay(d.day).split(' ')[0] }}</span>
          </div>
        </div>
      </section>
      <section class="panel card">
        <header><h2>Top pages</h2></header>
        <ul v-if="data.topPages.length" class="pages">
          <li v-for="p in data.topPages" :key="p.path">
            <span class="path">{{ p.path }}</span>
            <span class="track"><i :style="{ width: `${(p.count / data.topPages[0].count) * 100}%` }" /></span>
            <b>{{ p.count }}</b>
          </li>
        </ul>
        <p v-else class="muted">No visits yet. Open the website to generate some.</p>
      </section>
    </div>

    <section class="panel card">
      <header><h2>Latest leads</h2><NuxtLink to="/admin/leads" class="btn btn-sm">View all</NuxtLink></header>
      <div v-if="data.recentMessages.length" class="msgs">
        <div v-for="m in data.recentMessages" :key="m.id" class="msg">
          <span class="avatar">{{ m.name[0]?.toUpperCase() }}</span>
          <div>
            <b>{{ m.name }}</b> <span class="muted">· {{ m.email }}</span>
            <p>{{ m.message }}</p>
          </div>
          <span v-if="!m.read" class="new">New</span>
        </div>
      </div>
      <p v-else class="muted">No messages yet. Submissions from the contact form appear here.</p>
    </section>

    <p class="db muted"><Icon name="db" :size="14" /> Database: {{ data.database }}</p>
  </div>
</template>

<style scoped>
.ov { display: grid; gap: 22px; }
.hello h1 { font-size: 1.8rem; }
.hello p, .muted { color: var(--muted); }
.warn { display: flex; gap: 14px; padding: 16px 18px; border-color: color-mix(in srgb, #fbbf24 40%, transparent); background: rgba(251,191,36,.06); color: #fde68a; }
.warn p { color: var(--muted); font-size: .9rem; margin-top: 2px; }
.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.stat { padding: 20px; display: grid; gap: 4px; }
.ic { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: color-mix(in srgb, var(--accent) 22%, transparent); margin-bottom: 8px; }
.stat small { color: var(--muted); }
.stat b { font-family: var(--font-head); font-size: 2rem; line-height: 1.1; }
.sub { font-size: .8rem; color: var(--accent-2); }
.row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
.panel { padding: 22px; }
.panel header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 10px; }
.panel h2 { font-size: 1.1rem; }
.pipe { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.stage { display: grid; gap: 4px; padding: 12px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); font-size: .8rem; color: var(--muted); }
.stage:hover { border-color: var(--border-strong); }
.stage i { width: 8px; height: 8px; border-radius: 50%; }
.stage b { font-family: var(--font-head); font-size: 1.5rem; color: var(--text); }
.money { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); }
.money div { display: grid; }
.money small { color: var(--muted); font-size: .78rem; }
.money b { font-family: var(--font-head); font-size: 1.25rem; }
.money .won { color: var(--success); }
.fus { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.fus li { display: flex; justify-content: space-between; gap: 10px; font-size: .9rem; }
.fus span { color: #fbbf24; font-size: .8rem; }
.fus span.overdue { color: #fb7185; }
.chart { display: flex; align-items: flex-end; gap: 6px; height: 200px; }
.bar-col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; min-width: 0; }
.bar { width: 100%; max-width: 28px; min-height: 3px; border-radius: 6px 6px 2px 2px; background: var(--grad); position: relative; transition: height .6s cubic-bezier(.2,.7,.2,1); }
.val { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: .68rem; color: var(--muted); }
.lbl { font-size: .68rem; color: var(--faint); }
.pages { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.pages li { display: grid; grid-template-columns: 110px 1fr 36px; gap: 10px; align-items: center; font-size: .88rem; }
.path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
.track { height: 8px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
.track i { display: block; height: 100%; background: var(--grad); border-radius: inherit; }
.pages b { text-align: right; }
.msgs { display: grid; }
.msg { display: grid; grid-template-columns: 38px 1fr auto; gap: 12px; padding: 14px 0; border-top: 1px solid var(--border); align-items: start; }
.msg p { color: var(--muted); font-size: .9rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.avatar { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--grad); font-weight: 700; }
.new { font-size: .72rem; padding: 3px 9px; border-radius: 99px; background: color-mix(in srgb, var(--accent-2) 20%, transparent); color: var(--accent-2); }
.db { display: flex; align-items: center; gap: 6px; font-size: .8rem; }
@media (max-width: 640px) { .pipe { grid-template-columns: repeat(3, 1fr); } .money { grid-template-columns: 1fr; } }
@media (max-width: 1000px) { .cards { grid-template-columns: repeat(2, 1fr); } .row { grid-template-columns: 1fr; } }
</style>

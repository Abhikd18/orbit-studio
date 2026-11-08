<script setup lang="ts">
const { data } = await useContent()
const s = computed(() => data.value!.settings)
const featured = computed(() => {
  const list = data.value?.projects || []
  const f = list.filter(p => p.featured)
  return (f.length ? f : list).slice(0, 3)
})

useSeoMeta({
  title: () => `${s.value.brandName} — Web, Mobile & Cloud`,
  description: () => s.value.heroSubtitle,
  ogTitle: () => `${s.value.brandName} — Web, Mobile & Cloud`,
  ogDescription: () => s.value.heroSubtitle,
})

const metrics = [
  { value: '3', label: 'Platforms — web, Android, iOS' },
  { value: '1', label: 'Shared codebase' },
  { value: '100%', label: 'Content editable from admin' },
  { value: '24/7', label: 'Global edge hosting' },
]
const stack = [
  { name: 'Nuxt 4', note: 'SSR framework' },
  { name: 'Vue 3', note: 'UI layer' },
  { name: 'Nitro', note: 'Server API' },
  { name: 'Vercel', note: 'Edge hosting' },
  { name: 'Upstash Redis', note: 'Database' },
  { name: 'Capacitor', note: 'Native apps' },
  { name: 'PWA', note: 'Installable' },
  { name: 'Git', note: 'CI / CD' },
]
const steps = [
  { n: '01', t: 'Discover', d: 'We map your goals, users and content into a clear plan and sitemap.' },
  { n: '02', t: 'Design', d: 'Interactive prototypes with your brand, reviewed together before we build.' },
  { n: '03', t: 'Build', d: 'Website, admin and mobile app developed in parallel from one codebase.' },
  { n: '04', t: 'Launch', d: 'Deployed globally with Git-based previews, then handed over with training.' },
]

// PWA install button
const installEvt = ref<any>(null)
const installed = ref(false)
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvt.value = e
  })
  window.addEventListener('appinstalled', () => (installed.value = true))
})
async function install() {
  if (!installEvt.value) return
  installEvt.value.prompt()
  await installEvt.value.userChoice
  installEvt.value = null
}
</script>

<template>
  <div v-if="data">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-3d"><Hero3D /></div>
      <div class="container hero-inner">
        <div v-reveal class="badge"><span class="live" />{{ s.heroBadge }}</div>
        <h1 v-reveal="80">
          {{ s.heroTitle }}<br>
          <span class="grad-text">{{ s.heroHighlight }}</span>
        </h1>
        <p v-reveal="160" class="sub">{{ s.heroSubtitle }}</p>
        <div v-reveal="240" class="ctas">
          <NuxtLink to="/#contact" class="btn btn-primary">{{ s.ctaText }} <Icon name="arrow" :size="18" /></NuxtLink>
          <NuxtLink to="/#estimate" class="btn"><Icon name="bolt" :size="18" /> Instant price estimate</NuxtLink>
        </div>
        <div v-reveal="320" class="metrics">
          <div v-for="m in metrics" :key="m.label" class="metric">
            <b class="grad-text">{{ m.value }}</b>
            <span>{{ m.label }}</span>
          </div>
        </div>
      </div>
      <div class="marquee" aria-hidden="true">
        <div class="track">
          <span v-for="i in 2" :key="i">
            <template v-for="t in stack" :key="t.name">{{ t.name }} <i>✦</i> </template>
          </span>
        </div>
      </div>
    </section>

    <!-- SERVICES -->
    <section id="services" class="section">
      <div class="container">
        <div v-reveal class="section-head">
          <span class="eyebrow">What we do</span>
          <h2>Everything your business needs <span class="grad-text">online</span>.</h2>
          <p>From the first pixel to the app store — design, development, hosting and an admin panel you control.</p>
        </div>
        <div class="services">
          <article v-for="(sv, i) in data.services" :key="sv.id" v-reveal="i * 70" class="service card card-glow">
            <div class="icon"><Icon :name="sv.icon" :size="24" /></div>
            <h3>{{ sv.title }}</h3>
            <p>{{ sv.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- WORK -->
    <section id="work" class="section">
      <div class="container">
        <div class="head-row">
          <div v-reveal class="section-head">
            <span class="eyebrow">Selected work</span>
            <h2>Built to perform. Designed to <span class="grad-text">impress</span>.</h2>
          </div>
          <NuxtLink v-reveal to="/projects" class="btn">All projects <Icon name="arrow" :size="18" /></NuxtLink>
        </div>
        <div class="projects">
          <ProjectCard v-for="(p, i) in featured" :key="p.id" v-reveal="i * 90" :project="p" />
        </div>
      </div>
    </section>

    <!-- MOBILE -->
    <section id="mobile" class="section">
      <div class="container mobile">
        <div class="mobile-copy">
          <span v-reveal class="eyebrow">Mobile development</span>
          <h2 v-reveal="60">Your website <span class="grad-text">is</span> your app.</h2>
          <p v-reveal="120" class="lead">
            The same codebase runs as this website, an installable app on any phone, and native Android & iOS builds —
            all reading live data from the same cloud API.
          </p>
          <ul v-reveal="180" class="checks">
            <li><Icon name="check" :size="18" /> Installable PWA — works offline, opens full-screen</li>
            <li><Icon name="check" :size="18" /> Native Android & iOS apps via Capacitor</li>
            <li><Icon name="check" :size="18" /> Update content once, every platform changes</li>
            <li><Icon name="check" :size="18" /> Push notifications, camera & device APIs available</li>
          </ul>
          <div v-reveal="240" class="ctas">
            <button v-if="installEvt" class="btn btn-primary" @click="install"><Icon name="download" :size="18" /> Install the app</button>
            <span v-else-if="installed" class="tag">Installed ✓</span>
            <span v-else class="hint">Tip: open this site on your phone and choose <b>“Add to Home Screen”</b>.</span>
          </div>
        </div>
        <div v-reveal="100" class="mobile-visual">
          <div class="ring" />
          <PhoneMockup :brand="s.brandName" :projects="data.projects" />
        </div>
      </div>
    </section>

    <!-- STACK + PROCESS -->
    <section id="stack" class="section">
      <div class="container">
        <div v-reveal class="section-head">
          <span class="eyebrow">How we work</span>
          <h2>Modern stack. <span class="grad-text">Clear process.</span></h2>
          <p>Industry-standard, open-source tools — no lock-in, fast to build, cheap to run.</p>
        </div>
        <div class="stack">
          <div v-for="(t, i) in stack" :key="t.name" v-reveal="i * 40" class="chip card card-glow">
            <b>{{ t.name }}</b><span>{{ t.note }}</span>
          </div>
        </div>
        <div class="process">
          <div v-for="(p, i) in steps" :key="p.n" v-reveal="i * 90" class="step">
            <span class="num grad-text">{{ p.n }}</span>
            <h3>{{ p.t }}</h3>
            <p>{{ p.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="section">
      <div class="container about">
        <div>
          <span v-reveal class="eyebrow">About us</span>
          <h2 v-reveal="60">{{ s.aboutTitle }}</h2>
          <p v-reveal="120" class="lead">{{ s.aboutText }}</p>
        </div>
        <div v-reveal="120" class="about-side">
          <div v-if="s.founderName" class="founder card card-glow">
            <img v-if="s.founderPhoto" :src="s.founderPhoto" :alt="s.founderName" class="initials photo">
            <span v-else class="initials">{{ s.founderName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }}</span>
            <div>
              <b>{{ s.founderName }}</b>
              <span>{{ s.founderRole }}</span>
            </div>
            <a v-if="s.linkedin" :href="s.linkedin" target="_blank" rel="noopener" class="btn btn-sm">LinkedIn <Icon name="external" :size="14" /></a>
          </div>
          <ul class="promises">
            <li><Icon name="check" :size="18" /> You own 100% of the code</li>
            <li><Icon name="check" :size="18" /> Fixed quotes, no surprise bills</li>
            <li><Icon name="check" :size="18" /> Direct line to the people building it</li>
            <li><Icon name="check" :size="18" /> Weekly progress updates and previews</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS (only shown when published from admin) -->
    <section v-if="data.testimonials.length" class="section">
      <div class="container">
        <div v-reveal class="section-head">
          <span class="eyebrow">Kind words</span>
          <h2>What clients say</h2>
        </div>
        <div class="quotes">
          <figure v-for="(t, i) in data.testimonials" :key="t.id" v-reveal="i * 80" class="quote card">
            <blockquote>“{{ t.quote }}”</blockquote>
            <figcaption><b>{{ t.name }}</b><span>{{ t.role }}</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- ESTIMATOR -->
    <section id="estimate" class="section">
      <div class="container">
        <div v-reveal class="section-head">
          <span class="eyebrow">Price calculator</span>
          <h2>What will your project <span class="grad-text">cost</span>?</h2>
          <p>Pick what you need and get an instant ballpark. No sign-up, no sales call.</p>
        </div>
        <div v-reveal="80"><Estimator :config="data.estimator" /></div>
      </div>
    </section>

    <!-- BLOG -->
    <section v-if="data.posts.length" id="blog" class="section">
      <div class="container">
        <div class="head-row">
          <div v-reveal class="section-head">
            <span class="eyebrow">Insights</span>
            <h2>From the <span class="grad-text">blog</span></h2>
          </div>
          <NuxtLink v-reveal to="/blog" class="btn">All articles <Icon name="arrow" :size="18" /></NuxtLink>
        </div>
        <div class="posts">
          <PostCard v-for="(p, i) in data.posts.slice(0, 3)" :key="p.id" v-reveal="i * 80" :post="p" />
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section v-if="data.faqs.length" id="faq" class="section">
      <div class="container faq-wrap">
        <div v-reveal class="section-head">
          <span class="eyebrow">FAQ</span>
          <h2>Questions, <span class="grad-text">answered</span>.</h2>
          <p>Still curious? <NuxtLink to="/#contact" class="link">Ask us anything</NuxtLink>.</p>
        </div>
        <FaqList :faqs="data.faqs" />
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="section">
      <div class="container contact">
        <div class="contact-copy">
          <span v-reveal class="eyebrow">Contact</span>
          <h2 v-reveal="60">Let’s build something <span class="grad-text">remarkable</span>.</h2>
          <p v-reveal="120" class="lead">Tell us what you have in mind. We’ll reply with ideas, a timeline and a clear quote.</p>
          <div v-reveal="180" class="contact-list">
            <a :href="`mailto:${s.email}`"><Icon name="mail" /> {{ s.email }}</a>
            <span><Icon name="pin" /> {{ s.location }}</span>
          </div>
        </div>
        <div v-reveal="120"><ContactForm /></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero { position: relative; overflow: hidden; padding: 170px 0 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
.hero-inner { position: relative; text-align: center; display: flex; flex-direction: column; align-items: center; }
.hero-3d { position: absolute; left: 50%; top: 60px; width: min(900px, 120vw); aspect-ratio: 1; transform: translateX(-50%); opacity: .55; pointer-events: none; mask-image: radial-gradient(circle, #000 35%, transparent 70%); -webkit-mask-image: radial-gradient(circle, #000 35%, transparent 70%); }

.about { display: grid; grid-template-columns: 1.1fr .9fr; gap: 60px; align-items: center; }
.about h2, .faq-wrap h2 { font-size: clamp(2rem, 4.5vw, 3.2rem); margin-top: 14px; }
.about-side { display: grid; gap: 18px; }
.founder { display: flex; align-items: center; gap: 16px; padding: 20px; flex-wrap: wrap; }
.founder > div { flex: 1; display: grid; min-width: 140px; }
.founder span:not(.initials) { color: var(--muted); font-size: .9rem; }
.initials { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; background: var(--grad); font-family: var(--font-head); font-weight: 700; font-size: 1.2rem; box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 50%, transparent); }
.initials.photo { object-fit: cover; width: 72px; height: 72px; }
.promises { list-style: none; margin: 0; padding: 22px; display: grid; gap: 14px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); }
.promises li { display: flex; gap: 12px; align-items: center; }
.promises :deep(svg) { color: var(--success); flex: none; }
.posts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.faq-wrap { display: grid; grid-template-columns: .8fr 1.2fr; gap: 60px; align-items: start; }
.faq-wrap .section-head { margin-bottom: 0; position: sticky; top: 100px; }
.link { color: var(--accent-2); text-decoration: underline; text-underline-offset: 3px; }
.badge { display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--border-strong); background: rgba(255,255,255,.04); backdrop-filter: blur(10px); font-size: .85rem; color: var(--muted); }
.live { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 0 var(--success); animation: ping 2s infinite; }
@keyframes ping { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--success) 70%, transparent); } 100% { box-shadow: 0 0 0 10px transparent; } }
.hero h1 { font-size: clamp(2.6rem, 7.4vw, 5.6rem); margin: 28px 0 0; max-width: 1000px; font-weight: 700; letter-spacing: -0.035em; }
.sub { margin-top: 24px; max-width: 640px; font-size: clamp(1rem, 2vw, 1.2rem); color: var(--muted); }
.ctas { margin-top: 36px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; align-items: center; }
.metrics { margin-top: 80px; display: grid; grid-template-columns: repeat(4, 1fr); width: 100%; max-width: 920px; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(255,255,255,.025); backdrop-filter: blur(10px); }
.metric { padding: 22px 16px; display: grid; gap: 4px; }
.metric + .metric { border-left: 1px solid var(--border); }
.metric b { font-family: var(--font-head); font-size: 2rem; }
.metric span { color: var(--muted); font-size: .82rem; }
.marquee { margin-top: 80px; border-block: 1px solid var(--border); overflow: hidden; padding: 18px 0; mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); }
.track { display: flex; width: max-content; animation: marquee 30s linear infinite; font-family: var(--font-head); font-size: 1.15rem; color: var(--faint); }
.track span { white-space: pre; padding-right: 1ch; }
.track i { color: var(--accent); font-style: normal; margin: 0 1.2rem; }
@keyframes marquee { to { transform: translateX(-50%); } }

.services { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.service { padding: 30px; display: grid; gap: 12px; align-content: start; transition: transform .35s, border-color .35s; }
.service:hover { transform: translateY(-4px); border-color: var(--border-strong); }
.service h3 { font-size: 1.25rem; }
.service p { color: var(--muted); font-size: .95rem; }
.icon { width: 50px; height: 50px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 8px; color: #fff; background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 50%, transparent), color-mix(in srgb, var(--accent-2) 30%, transparent)); border: 1px solid rgba(255,255,255,.15); }

.head-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 56px; }
.head-row .section-head { margin-bottom: 0; }
.projects { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.mobile { display: grid; grid-template-columns: 1.1fr .9fr; gap: 60px; align-items: center; }
.mobile h2, .contact h2 { font-size: clamp(2rem, 4.5vw, 3.2rem); margin-top: 14px; }
.lead { color: var(--muted); margin-top: 18px; font-size: 1.08rem; max-width: 560px; }
.checks { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 14px; }
.checks li { display: flex; gap: 12px; align-items: center; }
.checks :deep(svg) { color: var(--success); flex: none; }
.mobile .ctas { justify-content: flex-start; }
.hint { color: var(--muted); font-size: .9rem; }
.mobile-visual { position: relative; display: grid; place-items: center; padding: 30px 0; }
.ring { position: absolute; width: 420px; max-width: 100%; aspect-ratio: 1; border-radius: 50%; border: 1px dashed var(--border-strong); animation: spin 40s linear infinite; }
.ring::after { content: ''; position: absolute; top: 12%; left: 8%; width: 14px; height: 14px; border-radius: 50%; background: var(--accent-2); box-shadow: 0 0 20px var(--accent-2); }
@keyframes spin { to { transform: rotate(360deg); } }

.stack { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.chip { padding: 18px 20px; display: grid; gap: 2px; }
.chip b { font-family: var(--font-head); }
.chip span { color: var(--muted); font-size: .85rem; }
.process { margin-top: 56px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
.step { border-top: 1px solid var(--border-strong); padding-top: 22px; display: grid; gap: 8px; }
.num { font-family: var(--font-head); font-weight: 700; font-size: 1rem; }
.step h3 { font-size: 1.3rem; }
.step p { color: var(--muted); font-size: .95rem; }

.quotes { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; }
.quote { margin: 0; padding: 30px; display: grid; gap: 20px; }
.quote blockquote { margin: 0; font-size: 1.1rem; }
.quote figcaption { display: grid; }
.quote figcaption span { color: var(--muted); font-size: .9rem; }

.contact { display: grid; grid-template-columns: .9fr 1.1fr; gap: 60px; align-items: start; }
.contact-list { display: grid; gap: 14px; margin-top: 30px; color: var(--muted); }
.contact-list > * { display: flex; align-items: center; gap: 12px; }
.contact-list a:hover { color: var(--text); }

@media (max-width: 960px) {
  .about, .faq-wrap { grid-template-columns: 1fr; gap: 36px; }
  .faq-wrap .section-head { position: static; }
  .posts { grid-template-columns: repeat(2, 1fr); }
  .services, .projects { grid-template-columns: repeat(2, 1fr); }
  .stack, .process { grid-template-columns: repeat(2, 1fr); }
  .mobile, .contact { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .hero { padding-top: 130px; }
  .metrics { grid-template-columns: repeat(2, 1fr); margin-top: 56px; }
  .metric:nth-child(3) { border-left: 0; }
  .metric:nth-child(n+3) { border-top: 1px solid var(--border); }
  .services, .projects, .process, .posts { grid-template-columns: 1fr; }
  .ring { width: 340px; }
}
</style>

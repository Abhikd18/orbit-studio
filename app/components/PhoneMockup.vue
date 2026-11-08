<script setup lang="ts">
import type { Project } from '~/composables/useContent'
defineProps<{ brand: string, projects: Project[] }>()
</script>

<!-- A live, data-driven preview of the mobile app (same content as the website) -->
<template>
  <div class="phone" aria-label="Mobile app preview">
    <div class="notch" />
    <div class="screen">
      <div class="status"><span>9:41</span><span>●●● ▮</span></div>
      <div class="app-head">
        <span class="dot" />
        <strong>{{ brand }}</strong>
      </div>
      <div class="hello">
        <small>Good morning</small>
        <b>Your projects</b>
      </div>
      <div class="list">
        <div v-for="(p, i) in projects.slice(0, 3)" :key="p.id" class="item" :style="{ animationDelay: `${i * 0.15}s` }">
          <span class="thumb" :style="{ background: p.gradient }" />
          <div>
            <b>{{ p.title }}</b>
            <small>{{ p.category }} · Live</small>
          </div>
        </div>
      </div>
      <div class="tabbar">
        <Icon name="grid" :size="18" /><Icon name="folder" :size="18" /><Icon name="inbox" :size="18" /><Icon name="cog" :size="18" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.phone { position: relative; width: 290px; max-width: 100%; aspect-ratio: 9 / 19; border-radius: 46px; padding: 12px; background: linear-gradient(145deg, #2a2d42, #0c0e1a); box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 40px 120px -20px color-mix(in srgb, var(--accent) 60%, transparent); animation: bob 6s ease-in-out infinite; }
.notch { position: absolute; top: 22px; left: 50%; transform: translateX(-50%); width: 90px; height: 24px; border-radius: 20px; background: #000; z-index: 2; }
.screen { height: 100%; border-radius: 36px; overflow: hidden; background: radial-gradient(circle at 20% 0%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 60%), #070814; padding: 16px 16px 0; display: flex; flex-direction: column; font-size: .8rem; }
.status { display: flex; justify-content: space-between; font-size: .7rem; font-weight: 600; padding: 2px 8px 18px; }
.app-head { display: flex; align-items: center; gap: 8px; font-family: var(--font-head); }
.dot { width: 18px; height: 18px; border-radius: 50%; background: var(--grad); }
.hello { margin: 20px 0 14px; display: grid; }
.hello small { color: var(--muted); }
.hello b { font-family: var(--font-head); font-size: 1.35rem; }
.list { display: grid; gap: 10px; flex: 1; align-content: start; }
.item { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 16px; background: rgba(255,255,255,.06); border: 1px solid var(--border); animation: slide .8s both cubic-bezier(.2,.7,.2,1); }
.item b { display: block; font-size: .78rem; line-height: 1.3; }
.item small { color: var(--muted); font-size: .68rem; }
.thumb { width: 38px; height: 38px; border-radius: 12px; flex: none; }
.tabbar { display: flex; justify-content: space-around; padding: 14px 0 22px; margin: 0 -16px; border-top: 1px solid var(--border); background: rgba(255,255,255,.03); color: var(--muted); }
.tabbar :first-child { color: var(--accent-2); }
@keyframes bob { 50% { transform: translateY(-14px) rotate(-1deg); } }
@keyframes slide { from { opacity: 0; transform: translateX(20px); } }
</style>

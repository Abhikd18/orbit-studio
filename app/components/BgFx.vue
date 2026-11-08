<!-- Futuristic animated background: aurora blobs + perspective grid + noise -->
<template>
  <div class="bgfx" aria-hidden="true">
    <div class="blob b1" />
    <div class="blob b2" />
    <div class="blob b3" />
    <div class="grid" />
    <div class="vignette" />
  </div>
</template>

<style scoped>
.bgfx { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; background: var(--bg); }
.blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .45; will-change: transform; }
.b1 { width: 620px; height: 620px; background: var(--accent); top: -220px; left: -140px; animation: float1 22s ease-in-out infinite; }
.b2 { width: 540px; height: 540px; background: var(--accent-2); top: 10%; right: -200px; opacity: .3; animation: float2 26s ease-in-out infinite; }
.b3 { width: 460px; height: 460px; background: #f472b6; bottom: -260px; left: 30%; opacity: .18; animation: float1 30s ease-in-out infinite reverse; }
.grid {
  position: absolute; inset: -50% -50% 0; transform-origin: 50% 0;
  transform: perspective(700px) rotateX(62deg) translateY(30%);
  background-image:
    linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, transparent 30%, #000 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent 30%, #000 70%, transparent);
  animation: gridmove 14s linear infinite;
}
.vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 40%, var(--bg) 100%); }
@keyframes float1 { 50% { transform: translate(120px, 80px) scale(1.1); } }
@keyframes float2 { 50% { transform: translate(-100px, 120px) scale(.9); } }
@keyframes gridmove { to { background-position: 0 64px, 0 0; } }
@media (max-width: 720px) { .blob { filter: blur(70px); } .b1 { width: 380px; height: 380px; } .b2 { width: 320px; height: 320px; } }
</style>

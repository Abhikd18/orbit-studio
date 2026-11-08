<script setup lang="ts">
/**
 * Interactive 3D hero object (Three.js): wireframe orb + glowing core + particle ring.
 * Follows the mouse, uses the brand colours, pauses when off-screen. Loaded only in the browser.
 */
const canvas = ref<HTMLCanvasElement>()
let cleanup = () => {}

onMounted(async () => {
  const el = canvas.value
  if (!el) return
  const THREE = await import('three')

  let renderer: InstanceType<typeof THREE.WebGLRenderer>
  try {
    renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true, powerPreference: 'low-power' })
  }
  catch {
    return // no WebGL: the page still looks fine without the 3D object
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const css = getComputedStyle(document.documentElement)
  const c1 = new THREE.Color(css.getPropertyValue('--accent').trim() || '#7c5cff')
  const c2 = new THREE.Color(css.getPropertyValue('--accent-2').trim() || '#22d3ee')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.z = 6.2
  const group = new THREE.Group()
  scene.add(group)

  // wireframe shell
  const shellGeo = new THREE.IcosahedronGeometry(1.6, 1)
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(shellGeo),
    new THREE.LineBasicMaterial({ color: c1, transparent: true, opacity: 0.55 }),
  )
  group.add(shell)

  // outer shell, counter-rotating
  const outerGeo = new THREE.IcosahedronGeometry(2.05, 0)
  const outer = new THREE.LineSegments(
    new THREE.WireframeGeometry(outerGeo),
    new THREE.LineBasicMaterial({ color: c2, transparent: true, opacity: 0.25 }),
  )
  group.add(outer)

  // glowing core (sprite with radial gradient texture)
  const tex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.25, `#${c1.getHexString()}`)
    grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  })()
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  core.scale.set(2.6, 2.6, 1)
  group.add(core)

  // particle ring
  const N = 1400
  const pos = new Float32Array(N * 3)
  const col = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 2.6 + (Math.random() - 0.5) * 0.9
    pos[i * 3] = Math.cos(a) * r
    pos[i * 3 + 1] = (Math.random() - 0.5) * 0.18
    pos[i * 3 + 2] = Math.sin(a) * r
    const c = c1.clone().lerp(c2, Math.random())
    col.set([c.r, c.g, c.b], i * 3)
  }
  const ringGeo = new THREE.BufferGeometry()
  ringGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  ringGeo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({ size: 0.028, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }))
  ring.rotation.x = 1.15
  ring.rotation.y = 0.3
  group.add(ring)

  // sizing
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = el
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  // mouse parallax
  const target = { x: 0, y: 0 }
  const onMove = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 0.6
    target.y = (e.clientY / window.innerHeight - 0.5) * 0.4
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting))
  io.observe(el)

  const clock = new THREE.Clock()
  let raf = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible) return
    const t = clock.getElapsedTime()
    if (!still) {
      shell.rotation.y = t * 0.12
      shell.rotation.x = t * 0.05
      outer.rotation.y = -t * 0.06
      outer.rotation.z = t * 0.03
      ring.rotation.z = t * 0.04
      core.scale.setScalar(2.5 + Math.sin(t * 1.4) * 0.12)
    }
    group.rotation.y += (target.x - group.rotation.y) * 0.04
    group.rotation.x += (target.y - group.rotation.x) * 0.04
    renderer.render(scene, camera)
  }
  tick()

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('pointermove', onMove)
    shellGeo.dispose(); outerGeo.dispose(); ringGeo.dispose(); tex.dispose()
    renderer.dispose()
  }
})
onBeforeUnmount(() => cleanup())
</script>

<template>
  <canvas ref="canvas" class="hero3d" aria-hidden="true" />
</template>

<style scoped>
.hero3d { width: 100%; height: 100%; display: block; animation: fadein 1.6s ease both; }
@keyframes fadein { from { opacity: 0; transform: scale(.9); } }
</style>

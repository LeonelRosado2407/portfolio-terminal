<template>
  <canvas ref="canvas" class="fixed inset-0 z-50 cursor-pointer" aria-hidden="true" @pointerdown="close"></canvas>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const DURATION = 8000
const FRAME_MS = 50
const FONT_SIZE = 16
// Half-width katakana like the film, plus digits and a little signature
const CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789LEONEL'

const emit = defineEmits(['done'])
const canvas = ref(null)
let drops = []
let frame = 0
let lastDraw = 0
let timer = 0
let closed = false

// Palette tokens are RGB triples ("10 14 10"), so the rain follows the active theme
const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

function resize() {
  const el = canvas.value
  const ratio = window.devicePixelRatio || 1
  el.width = window.innerWidth * ratio
  el.height = window.innerHeight * ratio
  el.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0)
  const columns = Math.ceil(window.innerWidth / FONT_SIZE)
  // Random negative starts so the columns don't fall in a straight line
  drops = Array.from({ length: columns }, (_, i) => drops[i] ?? -Math.floor(Math.random() * 40))
}

function draw(now) {
  frame = requestAnimationFrame(draw)
  if (now - lastDraw < FRAME_MS) return
  lastDraw = now
  const ctx = canvas.value.getContext('2d')
  const rows = window.innerHeight / FONT_SIZE
  ctx.fillStyle = `rgb(${token('--term-bg')} / 0.12)` // translucent wash leaves the fading trails
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`
  const accent = `rgb(${token('--term-accent')})`
  const head = `rgb(${token('--term-fg')})`
  drops.forEach((row, col) => {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)]
    ctx.fillStyle = Math.random() < 0.1 ? head : accent
    ctx.fillText(char, col * FONT_SIZE, row * FONT_SIZE)
    drops[col] = row > rows && Math.random() > 0.975 ? 0 : row + 1
  })
}

function close() {
  if (closed) return
  closed = true
  emit('done')
}

// Capture phase so the key that dismisses the rain never reaches the prompt
function onKey(event) {
  event.preventDefault()
  event.stopPropagation()
  close()
}

onMounted(() => {
  resize()
  const ctx = canvas.value.getContext('2d')
  ctx.fillStyle = `rgb(${token('--term-bg')})`
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
  frame = requestAnimationFrame(draw)
  timer = setTimeout(close, DURATION)
  window.addEventListener('keydown', onKey, { capture: true })
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  clearTimeout(timer)
  window.removeEventListener('keydown', onKey, { capture: true })
  window.removeEventListener('resize', resize)
})
</script>

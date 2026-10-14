<template>
  <BootScreen v-if="phase === 'boot'" :mode="mode" @done="onBootDone" />
  <TerminalWindow v-else :key="session" :animate-intro="animateIntro" @reboot="reboot" />
</template>

<script setup>
import { ref } from 'vue'
import BootScreen from './components/BootScreen.vue'
import TerminalWindow from './components/TerminalWindow.vue'
import { safeStorage } from './lib/storage'
import { bootMode } from './os/boot/script'

const storage = safeStorage()
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const mode = ref(bootMode({ seen: storage.get('bootSeen') === '1', reducedMotion }))
const phase = ref(mode.value === 'none' ? 'terminal' : 'boot')
// Only first visits get the typed login; returning visitors go straight to the banner
const animateIntro = ref(mode.value === 'full')
const session = ref(0)

function onBootDone({ skipped }) {
  storage.set('bootSeen', '1')
  if (skipped) animateIntro.value = false
  phase.value = 'terminal'
}

// `reboot` / `exit`: replay the full boot on purpose
function reboot() {
  mode.value = reducedMotion ? 'none' : 'full'
  animateIntro.value = mode.value === 'full'
  session.value++
  phase.value = mode.value === 'none' ? 'terminal' : 'boot'
}
</script>

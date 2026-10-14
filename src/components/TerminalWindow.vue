<template>
  <div class="h-[100dvh] flex sm:items-center sm:justify-center sm:p-6">
    <div class="flex flex-col w-full h-full sm:h-[min(85vh,48rem)] sm:max-w-4xl bg-term-bg overflow-hidden
                sm:border sm:border-term-fg/15 sm:rounded-lg sm:shadow-2xl"
         :class="{ 'animate-window-open': animateIntro }">
      <header class="flex items-center gap-2 px-4 py-2 bg-term-fg/5 border-b border-term-fg/10 select-none">
        <span class="w-3 h-3 rounded-full bg-term-error/80" aria-hidden="true"></span>
        <span class="w-3 h-3 rounded-full bg-term-accent/50" aria-hidden="true"></span>
        <span class="w-3 h-3 rounded-full bg-term-ok/80" aria-hidden="true"></span>
        <h1 class="flex-1 text-center text-xs text-term-dim truncate pr-12">{{ title }}</h1>
      </header>

      <div ref="scroller" class="flex-1 min-h-0 overflow-y-auto px-4 py-3 text-sm leading-relaxed" @click="focusInput">
        <div role="log" aria-live="polite" aria-relevant="additions">
          <OutputBlock v-for="line in lines" :key="line.id" :block="line" />
        </div>
        <PromptLine v-if="ready" ref="promptLine" />
      </div>

      <QuickBar />
    </div>

    <!-- Outside the window: its open animation uses transform, which would trap a fixed overlay -->
    <MatrixRain v-if="matrixOn" @done="matrixOn = false; focusPrompt()" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { createShell } from '../composables/useShell'
import { useTheme } from '../composables/useTheme'
import { saveLocale } from '../i18n/locale'
import { displayPath } from '../os/fs/path'
import { postMessage } from '../os/net/web3forms'
import MatrixRain from './MatrixRain.vue'
import OutputBlock from './OutputBlock.vue'
import PromptLine from './PromptLine.vue'
import QuickBar from './QuickBar.vue'

const props = defineProps({ animateIntro: { type: Boolean, default: false } })
const emit = defineEmits(['reboot'])

const { t, locale } = useI18n()
const matrixOn = ref(false)
const { theme, themes, setTheme } = useTheme()

const shell = createShell({
  t,
  locale,
  theme,
  themes,
  setTheme,
  setLocale(next) {
    locale.value = next
    saveLocale(next)
    document.documentElement.lang = next
  },
  openUrl(url) {
    window.open(url, '_blank', 'noopener')
  },
  download(href, filename) {
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    document.body.append(a)
    a.click()
    a.remove()
  },
  reboot() {
    setTimeout(() => emit('reboot'), 600)
  },
  matrix() {
    // With reduced motion the easter egg is just its line of text
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) matrixOn.value = true
  },
  sendMessage: (payload) => postMessage(payload, { accessKey: import.meta.env.VITE_WEB3FORMS_KEY }),
})
// Clicks and chips hand focus back to the prompt so the next keystrokes aren't lost
provide('shell', {
  ...shell,
  runCommand: (cmd) => shell.runCommand(cmd).then(focusPrompt),
  cancel: () => shell.cancel().then(focusPrompt),
})

const { lines, ready } = shell
const title = computed(() => `root@leonel-os: ${displayPath(shell.cwd.value)}`)
const scroller = ref(null)
const promptLine = ref(null)

// Keep the newest output in view. Watch the last id: the length stops changing once MAX_LINES is reached.
watch(() => lines.value.at(-1)?.id, () => {
  scroller.value?.scrollTo({ top: scroller.value.scrollHeight })
}, { flush: 'post' })

function focusInput(event) {
  if (event.target.closest('a, button')) return
  if (window.getSelection()?.toString()) return // let people copy text
  promptLine.value?.focus()
}

// Don't pop the on-screen keyboard on touch devices
function focusPrompt() {
  if (window.matchMedia('(pointer: fine)').matches) promptLine.value?.focus()
}

const skipIntro = () => shell.finishIntro()

onMounted(async () => {
  window.addEventListener('keydown', skipIntro)
  window.addEventListener('pointerdown', skipIntro)
  await shell.playIntro({ animate: props.animateIntro, lastLogin: new Date().toString().slice(0, 24) })
  window.removeEventListener('keydown', skipIntro)
  window.removeEventListener('pointerdown', skipIntro)
  await nextTick()
  focusPrompt()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', skipIntro)
  window.removeEventListener('pointerdown', skipIntro)
})
</script>

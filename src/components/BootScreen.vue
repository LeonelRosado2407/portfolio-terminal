<template>
  <div class="h-[100dvh] overflow-hidden bg-term-bg px-4 py-3 text-xs sm:text-sm cursor-default" @click="finish(true)">
    <p v-for="(line, i) in shown" :key="i" class="whitespace-pre-wrap break-words">
      <template v-if="line.startsWith(OK)"
        >{{ '[  ' }}<span class="text-term-ok">OK</span>{{ '  ]' + line.slice(OK.length) }}</template
      >
      <span v-else class="text-term-dim">{{ line }}</span>
    </p>
    <p class="fixed bottom-3 right-4 text-xs text-term-dim">{{ t('term.skip_hint') }}</p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { bootPlan } from '../os/boot/script'

const OK = '[  OK  ]'

const props = defineProps({ mode: { type: String, required: true } })
const emit = defineEmits(['done'])

const { t } = useI18n()
const shown = ref([])
const timers = []
let finished = false

function finish(skipped) {
  if (finished) return
  finished = true
  timers.forEach(clearTimeout)
  emit('done', { skipped })
}

const onKey = () => finish(true)

onMounted(() => {
  const plan = bootPlan(props.mode)
  plan.forEach(({ text, at }) => timers.push(setTimeout(() => shown.value.push(text), at)))
  timers.push(setTimeout(() => finish(false), (plan.at(-1)?.at ?? 0) + 400))
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', onKey)
})
</script>

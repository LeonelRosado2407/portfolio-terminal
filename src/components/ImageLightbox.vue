<template>
  <div
    role="dialog"
    aria-modal="true"
    :aria-label="current.alt"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-term-bg p-4 sm:p-8"
    @click.self="emit('close')"
  >
    <img
      :src="current.src"
      :alt="current.alt"
      class="max-w-full max-h-[75vh] object-contain border border-term-fg/15"
    />
    <p class="text-xs text-term-dim text-center" aria-live="polite">
      {{ index + 1 }} / {{ images.length }} · {{ current.alt }}
    </p>
    <div class="flex flex-wrap justify-center gap-2">
      <button v-if="images.length > 1" type="button" class="chip" @click="step(-1)">
        ← {{ t('term.gallery.prev') }}
      </button>
      <button ref="closeButton" type="button" class="chip" @click="emit('close')">
        Esc · {{ t('term.gallery.close') }}
      </button>
      <button v-if="images.length > 1" type="button" class="chip" @click="step(1)">
        {{ t('term.gallery.next') }} →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  images: { type: Array, required: true }, // [{ src, alt }]
  start: { type: Number, default: 0 },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const index = ref(props.start)
const current = computed(() => props.images[index.value])
const closeButton = ref(null)
let opener = null

function step(direction) {
  index.value = (index.value + direction + props.images.length) % props.images.length
}

// Capture phase so Esc and the arrows never reach the terminal prompt behind the viewer
function onKey(event) {
  const actions = { Escape: () => emit('close'), ArrowLeft: () => step(-1), ArrowRight: () => step(1) }
  const action = actions[event.key]
  if (!action) return
  event.preventDefault()
  event.stopPropagation()
  action()
}

onMounted(() => {
  opener = document.activeElement
  closeButton.value?.focus()
  window.addEventListener('keydown', onKey, { capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, { capture: true })
  opener?.focus?.() // give focus back to the thumbnail that opened the viewer
})
</script>

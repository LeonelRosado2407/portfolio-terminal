<template>
  <div>
    <form
      class="flex flex-wrap items-baseline gap-x-2 -mx-1 px-1 rounded-sm focus-within:ring-1 focus-within:ring-term-accent/40"
      @submit.prevent="onSubmit"
    >
      <span class="text-term-accent break-all min-w-0" aria-hidden="true">{{ prompt }}</span>
      <input
        ref="input"
        v-model="value"
        :readonly="busy"
        :aria-label="`${t('term.input_label')}: ${prompt}`"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="term-suggestions"
        :aria-expanded="open"
        :aria-activedescendant="open ? `term-suggestion-${selected}` : undefined"
        class="flex-1 min-w-[8ch] bg-transparent outline-none caret-term-accent text-term-fg"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="send"
        @keydown="onKeydown"
        @focus="focused = true"
        @blur="focused = false"
      />
    </form>

    <!-- In normal flow (not absolute) so it is never clipped at the top or bottom of the scroller -->
    <ul
      v-if="open"
      id="term-suggestions"
      ref="list"
      role="listbox"
      :aria-label="t('term.suggestions_label')"
      class="mt-1 mb-2 max-w-md border border-term-fg/20 bg-term-bg-2 text-xs sm:text-sm"
    >
      <li
        v-for="(item, i) in items"
        :id="`term-suggestion-${i}`"
        :key="item.value"
        role="option"
        :aria-selected="i === selected"
        class="flex items-baseline gap-3 px-2 py-1.5 sm:py-1 cursor-pointer"
        :class="i === selected ? 'bg-term-accent/15' : 'hover:bg-term-fg/5'"
        @mousedown.prevent
        @click="accept(item)"
      >
        <span class="shrink-0" :class="kindClass[item.kind]">{{ item.label }}</span>
        <span v-if="item.detail" class="text-term-dim truncate">{{ item.detail }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { prompt, busy, pending, submit, cancel, historyStep, tab, clear, suggestions } = inject('shell')
const value = ref('')
const input = ref(null)
const list = ref(null)

// IntelliSense-style list: hidden while answering a form, while busy, after Esc, or when unfocused
const focused = ref(false)
const dismissed = ref(false)
const selected = ref(0)
const navigated = ref(false) // Enter accepts only after the user picked with the arrows; otherwise it runs the line
const items = computed(() =>
  focused.value && !dismissed.value && !pending.value && !busy.value ? suggestions(value.value) : [],
)
const open = computed(() => items.value.length > 0)

const kindClass = {
  command: 'text-term-accent',
  dir: 'text-term-accent font-bold',
  file: 'text-term-fg',
  link: 'text-term-link',
  exec: 'text-term-ok',
  option: 'text-term-fg',
}

let fromHistory = false
watch(value, () => {
  // A line recalled with ↑/↓ keeps the list closed, so the next ↑ keeps walking the history
  dismissed.value = fromHistory
  fromHistory = false
  selected.value = 0
  navigated.value = false
})

watch(
  open,
  (isOpen) => {
    if (isOpen) list.value?.scrollIntoView({ block: 'nearest' })
  },
  { flush: 'post' },
)

function accept(item) {
  value.value = item.value
  input.value?.focus()
}

function onSubmit() {
  if (busy.value) return
  const line = value.value
  value.value = ''
  submit(line)
}

// Keys the open suggestion list takes over; returns true when handled
function onListKey(event) {
  const count = items.value.length
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    selected.value = (selected.value + (event.key === 'ArrowDown' ? 1 : -1) + count) % count
    navigated.value = true
  } else if (event.key === 'Tab' || (event.key === 'Enter' && navigated.value)) {
    accept(items.value[selected.value])
  } else if (event.key === 'Escape') {
    dismissed.value = true
  } else {
    return false
  }
  event.preventDefault()
  return true
}

function onKeydown(event) {
  if (open.value && onListKey(event)) return
  const key = event.key.toLowerCase()
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const recalled = historyStep(event.key === 'ArrowUp' ? -1 : 1, value.value)
    if (recalled !== value.value) {
      fromHistory = true
      value.value = recalled
    }
  } else if (event.key === 'Tab' && value.value) {
    // Only with text typed, so keyboard users can still Tab out of an empty prompt
    event.preventDefault()
    value.value = tab(value.value)
  } else if (event.ctrlKey && key === 'c') {
    // Ctrl+C copies when there is a selection; otherwise it interrupts, like a real terminal
    if (window.getSelection()?.toString()) return
    event.preventDefault()
    value.value = ''
    cancel()
  } else if (event.ctrlKey && key === 'l') {
    event.preventDefault()
    clear()
  }
}

defineExpose({ focus: () => input.value?.focus() })
</script>

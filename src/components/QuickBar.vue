<template>
  <nav :aria-label="t('term.quickbar_label')"
       class="border-t border-term-fg/10 bg-term-bg-2 px-3 py-2 sm:opacity-70 sm:hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
    <ul class="flex gap-2 overflow-x-auto sm:flex-wrap [scrollbar-width:none]">
      <li v-if="pending">
        <button type="button" class="chip border-term-error/50 text-term-error" @click="cancel()">{{ t('term.cancel') }} ^C</button>
      </li>
      <li v-for="cmd in CHIPS" :key="cmd">
        <button type="button" class="chip" :disabled="busy" @click="runCommand(cmd)">{{ cmd }}</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

const CHIPS = ['help', 'ls', 'cd ..', 'about', 'projects', 'experience', 'skills', 'cv', 'contact']

const { t } = useI18n()
const { pending, busy, cancel, runCommand } = inject('shell')
</script>

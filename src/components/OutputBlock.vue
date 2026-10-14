<template>
  <p v-if="block.type === 'echo'" class="whitespace-pre-wrap break-words">
    <span class="text-term-accent">{{ block.prompt }}</span> {{ block.input }}
  </p>

  <p
    v-else-if="block.type === 'text'"
    class="whitespace-pre-wrap break-words min-h-[1.5em]"
    :class="toneClass[block.tone]"
  >
    {{ block.text }}
  </p>

  <p v-else-if="block.type === 'error'" class="whitespace-pre-wrap break-words text-term-error">{{ block.text }}</p>

  <ul v-else-if="block.type === 'list'" class="flex flex-wrap gap-x-6 gap-y-1 my-1">
    <li v-for="item in block.items" :key="item.label">
      <button v-if="item.cmd" type="button" :class="[kindClass[item.kind], linkish]" @click="run(item.cmd)">
        {{ item.label }}
      </button>
      <span v-else :class="kindClass[item.kind]">{{ item.label }}</span>
    </li>
  </ul>

  <div v-else-if="block.type === 'actions'" class="flex flex-wrap items-center gap-2 my-2">
    <span v-if="block.label" class="text-term-dim">{{ block.label }}</span>
    <button
      v-for="cmd in block.items"
      :key="cmd"
      type="button"
      class="px-2 py-0.5 border border-term-accent/40 text-term-accent hover:bg-term-accent/10 focus-visible:outline focus-visible:outline-1 focus-visible:outline-term-accent"
      @click="run(cmd)"
    >
      {{ cmd }}
    </button>
  </div>

  <dl v-else-if="block.type === 'table'" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 my-1">
    <template v-for="row in block.rows" :key="row.label">
      <dt>
        <button v-if="row.cmd" type="button" :class="['text-term-accent', linkish]" @click="run(row.cmd)">
          {{ row.label }}
        </button>
        <span v-else class="text-term-dim">{{ row.label }}</span>
      </dt>
      <dd class="min-w-0 break-words">
        <a
          v-if="row.href"
          :href="row.href"
          target="_blank"
          rel="noopener"
          class="text-term-link underline underline-offset-2"
          >{{ row.value }}</a
        >
        <template v-else>{{ row.value }}</template>
      </dd>
    </template>
  </dl>

  <ul v-else-if="block.type === 'tags'" class="flex flex-wrap gap-1.5 my-1">
    <li v-for="tag in block.items" :key="tag" class="px-2 py-0.5 text-xs border border-term-fg/20">{{ tag }}</li>
  </ul>

  <p v-else-if="block.type === 'link'">
    <a
      :href="block.href"
      :download="block.download ? '' : undefined"
      target="_blank"
      rel="noopener"
      class="text-term-link underline underline-offset-2 break-all"
      >{{ block.label }}</a
    >
  </p>

  <figure v-else-if="block.type === 'image'" class="my-2">
    <button
      type="button"
      :aria-label="t('term.gallery.open', { alt: block.alt })"
      :class="thumb"
      @click="viewer = { images: [block], start: 0 }"
    >
      <img :src="block.src" alt="" class="max-w-full sm:max-w-xl max-h-[60vh] w-auto" />
    </button>
    <figcaption class="text-xs text-term-dim mt-1">{{ block.alt }}</figcaption>
  </figure>

  <ul v-else-if="block.type === 'gallery'" class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 max-w-3xl">
    <li v-for="(image, i) in block.images" :key="image.src">
      <button
        type="button"
        :aria-label="t('term.gallery.open', { alt: image.alt })"
        :class="[thumb, 'w-full']"
        @click="viewer = { images: block.images, start: i }"
      >
        <!-- Fixed aspect ratio so the layout doesn't jump when the lazy image arrives -->
        <img :src="image.src" alt="" loading="lazy" class="w-full aspect-video object-cover object-top" />
      </button>
    </li>
  </ul>

  <div v-else-if="block.type === 'banner'" class="flex flex-col sm:flex-row gap-x-8 gap-y-3 my-3">
    <pre aria-hidden="true" class="text-term-accent leading-tight text-[0.65rem] sm:text-xs">{{ block.art }}</pre>
    <div>
      <p class="text-term-accent font-bold">{{ block.title }}</p>
      <p class="text-term-dim mb-1">{{ block.subtitle }}</p>
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
        <template v-for="row in block.rows" :key="row.label">
          <dt class="text-term-accent">{{ row.label }}</dt>
          <dd class="min-w-0 break-words">{{ row.value }}</dd>
        </template>
      </dl>
    </div>
  </div>

  <!-- Teleported: the terminal window's open animation uses transform, which would trap a fixed overlay -->
  <Teleport to="body">
    <ImageLightbox v-if="viewer" :images="viewer.images" :start="viewer.start" @close="viewer = null" />
  </Teleport>
</template>

<script setup>
import { inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ImageLightbox from './ImageLightbox.vue'

defineProps({ block: { type: Object, required: true } })

const { t } = useI18n()
const { runCommand: run } = inject('shell')
const viewer = ref(null) // { images, start } while the lightbox is open

const thumb =
  'block border border-term-fg/15 hover:border-term-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-term-accent cursor-zoom-in'

const linkish = 'text-left hover:underline focus-visible:underline focus-visible:outline-none'
const toneClass = { dim: 'text-term-dim', accent: 'text-term-accent font-bold', ok: 'text-term-ok' }
const kindClass = {
  dir: 'text-term-accent font-bold',
  file: 'text-term-fg',
  link: 'text-term-link',
  exec: 'text-term-ok',
  option: 'text-term-fg',
}
</script>

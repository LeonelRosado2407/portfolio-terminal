import { computed, ref, shallowRef } from 'vue'
import * as b from '../os/blocks'
import { bannerBlock } from '../os/boot/banner'
import { commands } from '../os/commands'
import { buildFs } from '../os/fs/buildFs'
import { HOME, displayPath } from '../os/fs/path'
import { complete, suggestions } from '../os/shell/complete'
import { runLine } from '../os/shell/run'

const MAX_LINES = 500

/**
 * Terminal state and the bridge between the pure shell (src/os) and Vue.
 * env: { t, locale (ref), setLocale, theme (ref), themes, setTheme, openUrl, download, reboot, matrix, sendMessage }
 */
export function createShell(env) {
  const cwd = ref(HOME)
  const prevCwd = ref(HOME)
  const lines = ref([])
  const history = ref([])
  const busy = ref(false)
  const ready = ref(false)
  const pending = shallowRef(null) // { gen, label } while an interactive command waits for an answer
  const fs = computed(() => {
    env.locale.value // rebuild the tree when the language changes
    return buildFs(env.t)
  })
  const prompt = computed(() => pending.value?.label ?? `root@leonel-os:${displayPath(cwd.value)}$`)
  let nextId = 0
  let historyIndex = null
  let fastForward = false

  function push(block) {
    lines.value.push({ id: nextId++, ...block })
    if (lines.value.length > MAX_LINES) lines.value.splice(0, lines.value.length - MAX_LINES)
  }

  function clear() {
    lines.value = []
  }

  const ctx = {
    get fs() {
      return fs.value
    },
    get cwd() {
      return cwd.value
    },
    get prevCwd() {
      return prevCwd.value
    },
    get t() {
      return env.t
    },
    get locale() {
      return env.locale.value
    },
    get theme() {
      return env.theme.value
    },
    get history() {
      return history.value
    },
    themes: env.themes,
    commands,
    setCwd(path) {
      prevCwd.value = cwd.value
      cwd.value = path
    },
    setLocale: (next) => env.setLocale(next),
    setTheme: (name) => env.setTheme(name),
    openUrl: (url) => env.openUrl(url),
    download: (href, filename) => env.download(href, filename),
    reboot: () => env.reboot(),
    matrix: () => env.matrix(),
    sendMessage: (payload) => env.sendMessage(payload),
    clear,
  }

  // Drives a command's generator until it finishes or asks for input
  async function advance(gen, answer) {
    busy.value = true
    try {
      let step = await gen.next(answer)
      while (!step.done) {
        if (step.value.type === 'prompt') {
          pending.value = { gen, label: step.value.label }
          return
        }
        push(step.value)
        step = await gen.next()
      }
    } finally {
      busy.value = false
    }
  }

  // What the user typed + Enter. While a prompt is pending, the text is its answer.
  async function submit(input) {
    if (busy.value) return
    if (pending.value) {
      const { gen, label } = pending.value
      pending.value = null
      push({ type: 'echo', prompt: label, input })
      return advance(gen, input)
    }
    push({ type: 'echo', prompt: prompt.value, input })
    historyIndex = null
    if (input.trim()) history.value.push(input)
    return advance(runLine(input, ctx))
  }

  // Ctrl+C: abort the pending prompt, or just print ^C like a real shell
  async function cancel() {
    if (busy.value) return
    if (!pending.value) {
      push({ type: 'echo', prompt: prompt.value, input: '^C' })
      return
    }
    const { gen, label } = pending.value
    pending.value = null
    push({ type: 'echo', prompt: label, input: '^C' })
    await gen.return()
    push(b.text(env.t('term.msg.discarded'), 'dim'))
  }

  // Clicks and chips: never treated as a prompt answer
  async function runCommand(cmd) {
    if (busy.value) return
    if (pending.value) await cancel()
    return submit(cmd)
  }

  function historyStep(direction, current) {
    const entries = history.value
    if (!entries.length) return current
    if (historyIndex === null) {
      if (direction > 0) return current
      historyIndex = entries.length
    }
    historyIndex = Math.min(Math.max(historyIndex + direction, 0), entries.length)
    return entries[historyIndex] ?? ''
  }

  function tab(input) {
    const { value, options } = complete(input, ctx)
    if (options.length > 1 && value === input) push(b.list(options.map((label) => ({ label, kind: 'option' }))))
    return value
  }

  const sleep = (ms) => (fastForward ? Promise.resolve() : new Promise((done) => setTimeout(done, ms)))

  async function typeLine(prefix, typed) {
    push(b.text(prefix))
    const line = lines.value[lines.value.length - 1]
    for (const char of typed) {
      if (fastForward) {
        line.text = prefix + typed
        return
      }
      await sleep(70)
      line.text += char
    }
    await sleep(250)
  }

  // Login as root, then the neofetch banner. finishIntro() jumps to the end.
  async function playIntro({ animate, lastLogin }) {
    fastForward = !animate
    busy.value = true
    await typeLine('leonel-os login: ', 'root')
    await typeLine('Password: ', '••••••••')
    push(b.text(env.t('term.intro.last_login', { date: lastLogin }), 'dim'))
    push(bannerBlock(env.t))
    push(b.text(env.t('term.intro.hint'), 'dim'))
    busy.value = false
    ready.value = true
  }

  function finishIntro() {
    fastForward = true
  }

  return {
    lines,
    cwd,
    prompt,
    busy,
    ready,
    pending,
    submit,
    runCommand,
    cancel,
    historyStep,
    tab,
    clear,
    playIntro,
    finishIntro,
    suggestions: (input) => suggestions(input, ctx),
  }
}

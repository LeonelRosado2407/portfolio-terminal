import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { createShell } from './useShell'
import { makeT } from '../test/makeT'
import { textOf } from '../test/blocks'

function makeEnv(overrides = {}) {
  let t = makeT('en')
  const locale = ref('en')
  const theme = ref('green')
  const calls = []
  return {
    calls,
    locale,
    theme,
    themes: ['green', 'amber', 'dracula', 'light'],
    get t() { return t },
    setLocale(next) {
      t = makeT(next)
      locale.value = next
    },
    setTheme(name) { theme.value = name },
    openUrl: (url) => calls.push(['openUrl', url]),
    download: (href, name) => calls.push(['download', href, name]),
    reboot: () => calls.push(['reboot']),
    matrix: () => calls.push(['matrix']),
    sendMessage: async () => ({ ok: true }),
    ...overrides,
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))
const screen = (shell) => textOf(shell.lines.value)
const strip = ({ id, ...block }) => block

describe('createShell', () => {
  it('echoes the command with the prompt and prints its output', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('pwd')
    expect(shell.lines.value.map(strip)).toEqual([
      { type: 'echo', prompt: 'root@leonel-os:~$', input: 'pwd' },
      { type: 'text', text: '/root' },
    ])
  })

  it('updates the prompt after cd', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('cd projects')
    expect(shell.prompt.value).toBe('root@leonel-os:~/projects$')
  })

  it('walks the history with up and down, skipping blank lines', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('ls')
    await shell.submit('pwd')
    await shell.submit('   ')
    expect(shell.historyStep(-1, '')).toBe('pwd')
    expect(shell.historyStep(-1, 'pwd')).toBe('ls')
    expect(shell.historyStep(-1, 'ls')).toBe('ls')
    expect(shell.historyStep(1, 'ls')).toBe('pwd')
    expect(shell.historyStep(1, 'pwd')).toBe('')
  })

  it('asks for input during interactive commands and can be cancelled', async () => {
    const sent = []
    const shell = createShell(makeEnv({ sendMessage: async (p) => { sent.push(p); return { ok: true } } }))
    await shell.submit('send-message')
    expect(shell.prompt.value).toBe('Your name:')
    await shell.submit('Ana')
    expect(shell.lines.value.map(strip)).toContainEqual({ type: 'echo', prompt: 'Your name:', input: 'Ana' })
    expect(shell.prompt.value).toBe('Your email:')
    await shell.cancel()
    expect(shell.pending.value).toBeNull()
    expect(shell.prompt.value).toBe('root@leonel-os:~$')
    expect(screen(shell)).toContain('Message discarded.')
    expect(sent).toEqual([])
    expect(shell.historyStep(-1, '')).toBe('send-message') // answers never enter the history
  })

  it('clicking a command during a prompt cancels it first', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('send-message')
    await shell.runCommand('pwd')
    expect(shell.pending.value).toBeNull()
    expect(screen(shell)).toContain('Message discarded.')
    expect(strip(shell.lines.value.at(-1))).toEqual({ type: 'text', text: '/root' })
  })

  it('ignores input while a command is still running', async () => {
    let release
    const shell = createShell(makeEnv({ sendMessage: () => new Promise((resolve) => { release = resolve }) }))
    await shell.submit('send-message')
    await shell.submit('Ana')
    await shell.submit('ana@example.com')
    await shell.submit('A message long enough')
    const sending = shell.submit('y')
    await flush()
    expect(shell.busy.value).toBe(true)
    await shell.submit('pwd')
    release({ ok: true })
    await sending
    expect(shell.busy.value).toBe(false)
    expect(screen(shell)).not.toContain('/root')
  })

  it('keeps the current directory when the language changes', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('cd projects')
    await shell.submit('lang es')
    expect(shell.cwd.value).toBe('/root/projects')
    await shell.submit('cat ~/about.txt')
    expect(screen(shell)).toContain('Acerca de mí')
  })

  it('old clickable entries still work after moving elsewhere', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('cd projects')
    await shell.submit('ls')
    const list = shell.lines.value.findLast((line) => line.type === 'list')
    await shell.submit('cd ~/skills')
    await shell.runCommand(list.items.find((item) => item.label === 'nexus/').cmd)
    expect(shell.cwd.value).toBe('/root/projects/nexus')
  })

  it('tab completes and lists options when it cannot advance', () => {
    const shell = createShell(makeEnv())
    expect(shell.tab('he')).toBe('help ')
    expect(shell.tab('c')).toBe('c')
    expect(strip(shell.lines.value.at(-1))).toEqual({
      type: 'list', items: ['cat', 'cd', 'clear', 'contact', 'cv'].map((label) => ({ label, kind: 'option' })),
    })
  })

  it('hands the matrix rain to the environment', async () => {
    const env = makeEnv()
    const shell = createShell(env)
    await shell.submit('matrix')
    expect(env.calls).toEqual([['matrix']])
  })

  it('exposes suggestions for the current directory', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('cd contact')
    expect(shell.suggestions('cat ').map((s) => s.label)).toEqual(['contact.txt', 'send-message.sh'])
  })

  it('clear empties the screen', async () => {
    const shell = createShell(makeEnv())
    await shell.submit('pwd')
    await shell.submit('clear')
    expect(shell.lines.value).toEqual([])
  })

  it('plays the intro instantly when not animated', async () => {
    const shell = createShell(makeEnv())
    await shell.playIntro({ animate: false, lastLogin: 'Tue Oct 13 2026 19:44:02' })
    const text = screen(shell)
    expect(text).toContain('leonel-os login: root')
    expect(text).toContain('Password: ••••••••')
    expect(text).toContain('Last login: Tue Oct 13 2026 19:44:02 on tty1')
    expect(shell.lines.value.some((line) => line.type === 'banner')).toBe(true)
    expect(shell.busy.value).toBe(false)
    expect(shell.ready.value).toBe(true)
  })
})

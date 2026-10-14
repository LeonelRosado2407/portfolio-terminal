import { describe, it, expect } from 'vitest'
import { makeCtx, run } from '../../test/shell'
import { textOf } from '../../test/blocks'

describe('ls', () => {
  it('lists the home directory sorted, hiding dotfiles', async () => {
    const [block] = await run('ls', makeCtx())
    expect(block.type).toBe('list')
    expect(block.items.map((item) => item.label)).toEqual([
      'about.txt', 'contact/', 'cv/', 'experience/', 'projects/', 'services.txt', 'skills/',
    ])
  })

  it('shows dotfiles with -a', async () => {
    const [block] = await run('ls -a', makeCtx())
    expect(block.items[0].label).toBe('.secrets')
  })

  it('makes every entry clickable with an absolute command', async () => {
    const ctx = makeCtx()
    await run('cd projects', ctx)
    const [block] = await run('ls', ctx)
    expect(block.items).toContainEqual({ label: 'nexus/', kind: 'dir', cmd: 'cd ~/projects/nexus && ls' })
    const [nexus] = await run('ls nexus', ctx)
    expect(nexus.items[0]).toEqual({ label: 'README.md', kind: 'file', cmd: 'cat ~/projects/nexus/README.md' })
  })

  it('opens image folders as a gallery instead of cd-ing into them', async () => {
    const [block] = await run('ls ~/projects/nexus', makeCtx())
    expect(block.items).toContainEqual({ label: 'screenshots/', kind: 'dir', cmd: 'open ~/projects/nexus/screenshots' })
  })

  it('marks links and executables with the right action', async () => {
    const [cv] = await run('ls ~/cv', makeCtx())
    expect(cv.items[0]).toEqual({ label: 'leonel-rosado-cv-en.pdf', kind: 'link', cmd: 'open ~/cv/leonel-rosado-cv-en.pdf' })
    const [contact] = await run('ls contact', makeCtx())
    expect(contact.items).toContainEqual({ label: 'send-message.sh', kind: 'exec', cmd: '~/contact/send-message.sh' })
  })

  it('reports a missing path', async () => {
    expect(textOf(await run('ls nope', makeCtx()))).toBe('ls: no such file or directory: nope')
  })
})

describe('cd', () => {
  it('moves into directories and back home', async () => {
    const ctx = makeCtx()
    expect(await run('cd projects/nexus', ctx)).toEqual([])
    expect(ctx.cwd).toBe('/root/projects/nexus')
    await run('cd', ctx)
    expect(ctx.cwd).toBe('/root')
  })

  it('cd - returns to the previous directory and prints it', async () => {
    const ctx = makeCtx()
    await run('cd skills', ctx)
    await run('cd ~', ctx)
    expect(textOf(await run('cd -', ctx))).toBe('~/skills')
    expect(ctx.cwd).toBe('/root/skills')
  })

  it('refuses files and missing paths without moving', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('cd about.txt', ctx))).toBe('cd: not a directory: about.txt')
    expect(textOf(await run('cd nope', ctx))).toBe('cd: no such file or directory: nope')
    expect(ctx.cwd).toBe('/root')
  })
})

describe('cat', () => {
  it('prints file contents', async () => {
    expect(textOf(await run('cat about.txt', makeCtx()))).toContain('About me')
  })

  it('prints several files in order', async () => {
    const text = textOf(await run('cat skills/frontend.txt skills/tools.txt', makeCtx()))
    expect(text.indexOf('Frontend')).toBeLessThan(text.indexOf('Tools & workflow'))
  })

  it('shows the URL inside .url files', async () => {
    const [link] = await run('cat projects/nexus/demo.url', makeCtx())
    expect(link).toMatchObject({ type: 'link', href: 'https://nexus.leonelrosado.dev' })
  })

  it('explains directories, binaries and a missing operand', async () => {
    expect(textOf(await run('cat projects', makeCtx()))).toBe('cat: projects: Is a directory')
    const pdf = await run('cat cv/leonel-rosado-cv-en.pdf', makeCtx())
    expect(pdf).toEqual([
      { type: 'error', text: 'cat: cv/leonel-rosado-cv-en.pdf: binary file' },
      { type: 'actions', label: 'Try:', items: ['open ~/cv/leonel-rosado-cv-en.pdf'] },
    ])
    expect(textOf(await run('cat', makeCtx()))).toBe('cat: missing operand')
  })
})

describe('help, pwd, history, clear', () => {
  it('help lists visible commands with descriptions', async () => {
    const out = await run('help', makeCtx())
    const table = out.find((block) => block.type === 'table')
    expect(table.rows).toContainEqual({ label: 'ls', value: 'list files in a directory', cmd: 'ls' })
    expect(table.rows.every((row) => row.value)).toBe(true)
  })

  it('pwd prints the absolute path', async () => {
    expect(textOf(await run('pwd', makeCtx()))).toBe('/root')
  })

  it('history numbers previous commands', async () => {
    const ctx = makeCtx({ history: ['ls', 'pwd', 'history'] })
    expect(textOf(await run('history', ctx))).toBe('   1  ls\n   2  pwd\n   3  history')
  })

  it('clear asks the shell to clear the screen', async () => {
    const ctx = makeCtx()
    expect(await run('clear', ctx)).toEqual([])
    expect(ctx.calls).toContainEqual(['clear'])
  })
})

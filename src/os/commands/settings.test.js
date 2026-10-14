import { describe, it, expect } from 'vitest'
import { makeCtx, run } from '../../test/shell'
import { textOf } from '../../test/blocks'

describe('lang', () => {
  it('switches language and answers in the new one', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('lang es', ctx))).toBe('Idioma cambiado a español.')
    expect(ctx.calls).toContainEqual(['setLocale', 'es'])
  })

  it('is case-insensitive', async () => {
    const ctx = makeCtx({ locale: 'es' })
    expect(textOf(await run('lang EN', ctx))).toBe('Language set to English.')
  })

  it('shows usage for anything else', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('lang fr', ctx))).toBe('usage: lang es|en')
    expect(ctx.calls).toEqual([])
  })
})

describe('theme', () => {
  it('lists themes and marks the current one', async () => {
    const out = await run('theme', makeCtx())
    expect(out[0].text).toBe('Available themes (current: green):')
    expect(out[1]).toEqual({
      type: 'actions',
      label: null,
      items: ['theme green', 'theme amber', 'theme dracula', 'theme light'],
    })
  })

  it('sets a known theme', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('theme Amber', ctx))).toBe('Theme set to amber.')
    expect(ctx.calls).toContainEqual(['setTheme', 'amber'])
  })

  it('rejects unknown themes', async () => {
    const ctx = makeCtx()
    const out = await run('theme pink', ctx)
    expect(out[0]).toEqual({ type: 'error', text: 'theme: unknown theme: pink' })
    expect(ctx.calls).toEqual([])
  })
})

describe('reboot', () => {
  it.each(['reboot', 'exit', 'logout'])('%s restarts the OS', async (name) => {
    const ctx = makeCtx()
    expect(textOf(await run(name, ctx))).toBe('Rebooting leonel-os…')
    expect(ctx.calls).toContainEqual(['reboot'])
  })
})

describe('easter eggs', () => {
  it('sudo reminds you that you are root', async () => {
    expect(textOf(await run('sudo rm -rf /', makeCtx()))).toContain("You're already root")
  })

  it('rm refuses and leaves the filesystem alone', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('rm -rf /', ctx))).toContain('refusing to delete this portfolio')
    expect((await run('ls', ctx))[0].items.length).toBeGreaterThan(0)
  })

  it('editors mention the name they were called with', async () => {
    expect(textOf(await run('nano about.txt', makeCtx()))).toMatch(/^nano: no editors here/)
  })

  it('hack points to contact', async () => {
    const out = await run('hack', makeCtx())
    expect(out[1]).toEqual({ type: 'actions', label: 'Try:', items: ['contact'] })
  })

  it('matrix wakes Neo up and starts the rain', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('matrix', ctx))).toBe('Wake up, Neo… The Matrix has you.')
    expect(ctx.calls).toEqual([['matrix']])
  })

  it('.secrets has a message', async () => {
    expect(textOf(await run('cat .secrets', makeCtx()))).toContain('secret file')
  })

  it('eggs stay out of help', async () => {
    const table = (await run('help', makeCtx())).find((block) => block.type === 'table')
    const names = table.rows.map((row) => row.label)
    for (const egg of ['sudo', 'rm', 'vim', 'hack', 'coffee', 'matrix']) expect(names).not.toContain(egg)
    expect(names).toContain('reboot')
  })
})

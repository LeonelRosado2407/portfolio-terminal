import { describe, it, expect } from 'vitest'
import { makeCtx, run } from '../../test/shell'
import { textOf } from '../../test/blocks'

describe('runLine', () => {
  it('does nothing for blank input', async () => {
    expect(await run('   ', makeCtx())).toEqual([])
  })

  it('suggests a close command when one is not found', async () => {
    const out = await run('lss', makeCtx())
    expect(out).toEqual([
      { type: 'error', text: 'command not found: lss' },
      { type: 'actions', label: 'Did you mean:', items: ['ls'] },
    ])
  })

  it('points to help when nothing is close', async () => {
    const out = await run('xyzzy', makeCtx())
    expect(out[1]).toEqual({ type: 'actions', label: 'Try:', items: ['help'] })
  })

  it('refuses to execute plain files, directories and missing paths', async () => {
    expect(textOf(await run('./about.txt', makeCtx()))).toBe('zsh: permission denied: ./about.txt')
    expect(textOf(await run('./projects', makeCtx()))).toBe('zsh: ./projects: Is a directory')
    expect(textOf(await run('./nope', makeCtx()))).toBe('zsh: no such file or directory: ./nope')
  })

  it('turns a crashing command into an error block', async () => {
    const ctx = makeCtx()
    ctx.commands = [
      ...ctx.commands,
      {
        name: 'boom',
        run() {
          throw new Error('kaboom')
        },
      },
    ]
    expect(await run('boom', ctx)).toEqual([
      { type: 'error', text: 'boom: something went wrong, but the terminal is still alive.' },
    ])
  })

  it('rejects extra arguments like zsh, without running the command', async () => {
    const ctx = makeCtx()
    expect(await run('cd projects skills', ctx)).toEqual([{ type: 'error', text: 'cd: too many arguments' }])
    expect(ctx.cwd).toBe('/root')
    expect(textOf(await run('open about.txt about.txt about.txt', ctx))).toBe('open: too many arguments')
    expect(textOf(await run('pwd hola', ctx))).toBe('pwd: too many arguments')
    expect(textOf(await run('projects now', ctx))).toBe('projects: too many arguments')
    expect(textOf(await run('cd a b', makeCtx({ locale: 'es' })))).toBe('cd: demasiados argumentos')
  })

  it('does not count flags as arguments, and lets cat take several files', async () => {
    const ctx = makeCtx()
    expect((await run('ls -a projects', ctx))[0].type).toBe('list')
    expect(textOf(await run('ls projects skills', ctx))).toBe('ls: too many arguments')
    expect(textOf(await run('cat about.txt services.txt', ctx))).toContain('About me')
  })

  it('lets easter eggs take anything', async () => {
    expect(textOf(await run('sudo rm -rf / --no-preserve-root', makeCtx()))).toContain("You're already root")
  })

  it('chains commands with && and stops at the first error', async () => {
    const ctx = makeCtx()
    expect(textOf(await run('cd projects && pwd', ctx))).toBe('/root/projects')
    expect(textOf(await run('cd nope && pwd', ctx))).toBe('cd: no such file or directory: nope')
  })
})

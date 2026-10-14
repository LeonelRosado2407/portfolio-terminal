import { describe, it, expect } from 'vitest'
import { complete, suggestions } from './complete'
import { makeCtx } from '../../test/shell'

describe('complete', () => {
  const ctx = makeCtx()

  it('completes a unique command and adds a space', () => {
    expect(complete('he', ctx)).toEqual({ value: 'help ', options: [] })
  })

  it('lists every visible match when ambiguous', () => {
    expect(complete('c', ctx)).toEqual({ value: 'c', options: ['cat', 'cd', 'clear', 'contact', 'cv'] })
  })

  it('completes directories with a trailing slash and no space', () => {
    expect(complete('cd pro', ctx).value).toBe('cd projects/')
  })

  it('completes nested and home-relative paths', () => {
    expect(complete('cat ~/contact/con', ctx).value).toBe('cat ~/contact/contact.txt ')
  })

  it('completes executables typed as a path', () => {
    expect(complete('./se', makeCtx({ cwd: '/root/contact' })).value).toBe('./send-message.sh ')
  })

  it('hides dotfiles unless the word starts with a dot', () => {
    expect(complete('cat .s', ctx).value).toBe('cat .secrets ')
    expect(complete('ls ', ctx).options).not.toContain('.secrets')
  })

  it('extends to the common prefix and lists the options', () => {
    const result = complete('cat ~/experience/0', ctx)
    expect(result.value).toBe('cat ~/experience/0')
    expect(result.options).toHaveLength(4)
  })

  it('leaves the input alone when nothing matches', () => {
    expect(complete('cat nope/x', ctx)).toEqual({ value: 'cat nope/x', options: [] })
  })
})

describe('suggestions', () => {
  const ctx = makeCtx()
  const labels = (input, c = ctx) => suggestions(input, c).map((s) => s.label)

  it('suggests nothing for an empty line', () => {
    expect(suggestions('', ctx)).toEqual([])
    expect(suggestions('   ', ctx)).toEqual([])
  })

  it('suggests commands with their description', () => {
    expect(suggestions('pr', ctx)).toEqual([
      { value: 'projects ', label: 'projects', detail: 'my projects', kind: 'command' },
    ])
    expect(labels('c')).toEqual(['cat', 'cd', 'clear', 'contact', 'cv'])
  })

  it('never reveals hidden commands', () => {
    expect(labels('mat')).toEqual([])
    expect(labels('co')).toEqual(['contact'])
  })

  it('suggests only directories for cd', () => {
    const items = suggestions('cd ', ctx)
    expect(items.map((s) => s.label)).toEqual(['contact/', 'cv/', 'experience/', 'projects/', 'skills/'])
    expect(items.every((s) => s.kind === 'dir')).toBe(true)
    expect(items[3].value).toBe('cd projects/')
  })

  it('suggests files for cat, including nested paths', () => {
    expect(suggestions('cat ~/contact/', ctx)).toEqual([
      { value: 'cat ~/contact/contact.txt ', label: 'contact.txt', detail: '', kind: 'file' },
      { value: 'cat ~/contact/send-message.sh ', label: 'send-message.sh', detail: '', kind: 'exec' },
    ])
  })

  it('suggests the known values for lang and theme', () => {
    expect(suggestions('lang ', ctx).map((s) => s.value)).toEqual(['lang en ', 'lang es '])
    expect(labels('theme d')).toEqual(['dracula'])
  })

  it('offers no arguments to commands that take none', () => {
    expect(suggestions('pwd ', ctx)).toEqual([])
  })

  it('stops suggesting once the command has all its arguments', () => {
    const skills = makeCtx({ cwd: '/root/skills' })
    expect(suggestions('open backend.txt ', skills)).toEqual([])
    expect(suggestions('cd projects ', ctx)).toEqual([])
    expect(suggestions('lang es ', ctx)).toEqual([])
    expect(complete('open backend.txt b', skills)).toEqual({ value: 'open backend.txt b', options: [] })
  })

  it('keeps suggesting for cat and does not count flags', () => {
    expect(suggestions('cat about.txt ', ctx).length).toBeGreaterThan(0)
    expect(suggestions('ls -a ', ctx).length).toBeGreaterThan(0)
  })

  it('shows at most 6 suggestions', () => {
    expect(suggestions('cat ', ctx)).toHaveLength(6)
  })
})

describe('complete uses the same argument rules', () => {
  it('completes lang values instead of paths', () => {
    expect(complete('lang e', makeCtx())).toEqual({ value: 'lang e', options: ['en', 'es'] })
    expect(complete('lang s', makeCtx()).value).toBe('lang s') // nothing in ~ like "skills/"
  })
})

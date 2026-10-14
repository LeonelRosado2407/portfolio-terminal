import { describe, it, expect } from 'vitest'
import { messages } from './messages'
import { makeT } from '../test/makeT'

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? keys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('messages', () => {
  it('es and en define exactly the same keys', () => {
    expect(keys(messages.es).sort()).toEqual(keys(messages.en).sort())
  })

  it('makeT throws on unknown keys so typos fail tests', () => {
    expect(() => makeT('en')('term.nope')).toThrow(/term\.nope/)
  })

  it('renders a literal pipe instead of treating it as plural syntax', () => {
    expect(makeT('en')('term.lang.usage')).toBe('usage: lang es|en')
    expect(makeT('es')('term.lang.usage')).toBe('uso: lang es|en')
  })
})

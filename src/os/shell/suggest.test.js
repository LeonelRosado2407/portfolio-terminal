import { describe, it, expect } from 'vitest'
import { distance, suggest } from './suggest'

describe('distance', () => {
  it.each([
    ['ls', 'ls', 0],
    ['ls', 'lss', 1],
    ['cat', 'cta', 2],
    ['', 'abc', 3],
    ['help', 'hlep', 2],
  ])('distance(%s, %s) = %i', (a, b, expected) => {
    expect(distance(a, b)).toBe(expected)
  })
})

describe('suggest', () => {
  const names = ['help', 'ls', 'cd', 'cat', 'clear', 'contact']

  it('suggests the closest command', () => {
    expect(suggest('lss', names)).toBe('ls')
    expect(suggest('clea', names)).toBe('clear')
    expect(suggest('HELP', names)).toBe('help')
  })

  it('returns null when nothing is close enough', () => {
    expect(suggest('xyzzy', names)).toBeNull()
  })
})

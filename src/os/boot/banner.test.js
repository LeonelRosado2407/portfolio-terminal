import { describe, it, expect } from 'vitest'
import { LOGO } from './banner'

describe('LOGO', () => {
  it('uses printable ASCII only, so every monospace font lines it up', () => {
    expect(LOGO).toMatch(/^[\x20-\x7e\n]+$/)
  })

  it('has lines of equal width', () => {
    const widths = new Set(LOGO.split('\n').map((line) => line.length))
    expect(widths.size).toBe(1)
  })
})

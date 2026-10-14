import { describe, it, expect } from 'vitest'
import { tokenize, parse, splitFlags } from './parse'

describe('tokenize', () => {
  it('splits on any whitespace', () => {
    expect(tokenize('  ls   -a\tprojects ')).toEqual(['ls', '-a', 'projects'])
  })

  it('keeps quoted words together', () => {
    expect(tokenize(`cat "my file.txt" 'other one'`)).toEqual(['cat', 'my file.txt', 'other one'])
  })

  it('keeps empty quoted strings', () => {
    expect(tokenize('echo ""')).toEqual(['echo', ''])
  })

  it('treats an unclosed quote as running to the end', () => {
    expect(tokenize('cat "abc def')).toEqual(['cat', 'abc def'])
  })
})

describe('parse', () => {
  it('returns null for blank input', () => {
    expect(parse('   ')).toBeNull()
  })

  it('separates the command name from its args', () => {
    expect(parse('cd ~/projects')).toEqual({ name: 'cd', args: ['~/projects'] })
  })
})

describe('splitFlags', () => {
  it('collects single-letter flags, including combined ones', () => {
    const { flags, operands } = splitFlags(['-la', 'projects'])
    expect([...flags].sort()).toEqual(['a', 'l'])
    expect(operands).toEqual(['projects'])
  })

  it('treats a lone dash as an operand', () => {
    expect(splitFlags(['-']).operands).toEqual(['-'])
  })
})

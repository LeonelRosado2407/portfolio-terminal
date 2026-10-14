import { describe, it, expect } from 'vitest'
import { detectLocale, saveLocale } from './locale'

const memory = (initial = {}) => {
  const data = { ...initial }
  return { data, get: (k) => data[k] ?? null, set: (k, v) => { data[k] = v } }
}

describe('detectLocale', () => {
  it('prefers the saved language', () => {
    expect(detectLocale(memory({ lang: 'es' }), { language: 'en-US' })).toBe('es')
  })

  it('falls back to the browser language', () => {
    expect(detectLocale(memory(), { language: 'es-MX' })).toBe('es')
    expect(detectLocale(memory(), { language: 'fr-FR' })).toBe('en')
  })

  it('ignores unknown saved values', () => {
    expect(detectLocale(memory({ lang: 'xx' }), { language: 'en-US' })).toBe('en')
  })
})

describe('saveLocale', () => {
  it('stores the language under "lang"', () => {
    const storage = memory()
    saveLocale('es', storage)
    expect(storage.data.lang).toBe('es')
  })
})

import { describe, it, expect } from 'vitest'
import { safeStorage } from './storage'

describe('safeStorage', () => {
  it('reads and writes through the backend', () => {
    const data = {}
    const backend = {
      getItem: (k) => data[k] ?? null,
      setItem: (k, v) => {
        data[k] = v
      },
    }
    const storage = safeStorage(() => backend)
    storage.set('lang', 'es')
    expect(storage.get('lang')).toBe('es')
    expect(storage.get('missing')).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    const storage = safeStorage(() => {
      throw new Error('SecurityError')
    })
    expect(storage.get('lang')).toBeNull()
    expect(() => storage.set('lang', 'es')).not.toThrow()
  })
})

// localStorage wrapper that never throws (private mode, blocked cookies, SSR)
export function safeStorage(getBackend = () => globalThis.localStorage) {
  return {
    get(key) {
      try {
        return getBackend()?.getItem(key) ?? null
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        getBackend()?.setItem(key, value)
      } catch {
        // Storage unavailable: the preference just won't persist
      }
    },
  }
}

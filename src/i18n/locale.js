import { safeStorage } from '../lib/storage'

export const LOCALES = ['en', 'es']
const KEY = 'lang'

export function detectLocale(storage = safeStorage(), nav = globalThis.navigator) {
  const stored = storage.get(KEY)
  if (LOCALES.includes(stored)) return stored
  return nav?.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function saveLocale(locale, storage = safeStorage()) {
  storage.set(KEY, locale)
}

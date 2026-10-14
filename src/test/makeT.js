import { createI18n } from 'vue-i18n'
import { messages } from '../i18n/messages'

// Real translations for tests; unknown keys throw so a typo can't hide behind the key name
export function makeT(locale = 'en') {
  const { global } = createI18n({ legacy: false, locale, fallbackLocale: 'en', messages })
  return (key, params) => {
    if (!global.te(key, locale)) throw new Error(`Missing i18n key "${key}" for ${locale}`)
    return global.t(key, params ?? {})
  }
}

import { createI18n } from 'vue-i18n'
import { messages } from './messages'
import { detectLocale } from './locale'

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
})

export default i18n

import en from './lang/en.json'
import es from './lang/es.json'
import termEn from './lang/term.en.json'
import termEs from './lang/term.es.json'

// v1 portfolio copy (en/es.json) plus the terminal's own strings under `term`
export const messages = {
  en: { ...en, term: termEn },
  es: { ...es, term: termEs },
}

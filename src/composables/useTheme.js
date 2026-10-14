import { ref } from 'vue'
import { applyFavicon } from '../lib/favicon'
import { safeStorage } from '../lib/storage'

// Keep in sync with style.css palettes and the inline script in index.html
export const THEMES = ['green', 'amber', 'dracula', 'light']

const storage = safeStorage()
const saved = storage.get('theme')
const theme = ref(THEMES.includes(saved) ? saved : 'green')

export function useTheme() {
  function setTheme(name) {
    if (!THEMES.includes(name)) return
    theme.value = name
    document.documentElement.dataset.theme = name
    storage.set('theme', name)
    applyFavicon()
  }
  return { theme, themes: THEMES, setTheme }
}

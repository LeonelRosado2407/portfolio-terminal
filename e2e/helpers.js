import { expect } from '@playwright/test'

export const PROMPT_INPUT = 'input[role=combobox]'

// Returning visitor in English: short boot, no typed login, predictable copy
export async function openTerminal(page, { theme, lang = 'en' } = {}) {
  await page.addInitScript(
    ({ theme, lang }) => {
      // Runs on every navigation: only seed values, so reloads keep what the page saved
      const seed = (key, value) => value && localStorage.getItem(key) === null && localStorage.setItem(key, value)
      seed('bootSeen', '1')
      seed('lang', lang)
      seed('theme', theme)
    },
    { theme, lang },
  )
  await page.goto('/')
  await expect(page.locator(PROMPT_INPUT)).toBeVisible()
}

// Types a command and runs it, closing the suggestion list first so Enter always submits
export async function run(page, command) {
  const input = page.locator(PROMPT_INPUT)
  await input.fill(command)
  await input.press('Escape')
  await input.press('Enter')
}

export const output = (page) => page.locator('[role=log]')
export const chip = (page, name) => page.locator('nav button', { hasText: new RegExp(`^${name}$`) })
export const scroller = (page) => page.locator('[role=log]').locator('..')

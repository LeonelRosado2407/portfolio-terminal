import { test, expect } from '@playwright/test'
import { PROMPT_INPUT, run } from './helpers'

test.describe('boot', () => {
  test('first visit plays the boot log, types the login and shows the banner', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Booting Linux on physical CPU')).toBeVisible()
    await expect(page.getByText('leonel-os login: root')).toBeVisible({ timeout: 8_000 })
    await expect(page.locator(PROMPT_INPUT)).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText('Open to freelance projects')).toBeVisible()
  })

  test('any key skips the boot', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Booting Linux on physical CPU')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(page.locator(PROMPT_INPUT)).toBeVisible({ timeout: 2_000 })
  })

  test('returning visitors get a short boot', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bootSeen', '1'))
    await page.goto('/')
    await expect(page.locator(PROMPT_INPUT)).toBeVisible({ timeout: 2_000 })
  })

  test('reboot replays the full boot', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('bootSeen', '1'))
    await page.goto('/')
    await run(page, 'reboot')
    await expect(page.getByText('Booting Linux on physical CPU')).toBeVisible()
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('skips the boot entirely', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator(PROMPT_INPUT)).toBeVisible({ timeout: 2_000 })
    await expect(page.getByText('Booting Linux on physical CPU')).toHaveCount(0)
  })
})

import { test, expect } from '@playwright/test'
import { PROMPT_INPUT, chip, openTerminal, output, run } from './helpers'

test.beforeEach(async ({ page }) => {
  await openTerminal(page)
})

test('a visitor can reach a project, its demo and the CV with clicks only', async ({ page }) => {
  await chip(page, 'projects').click()
  await page.locator('[role=log] dt button', { hasText: 'nexus/' }).last().click()
  await expect(output(page)).toContainText('Lighthouse 100 in all four categories')

  const popup = page.waitForEvent('popup')
  await page.locator('[role=log] button', { hasText: 'demo.url' }).last().click()
  expect((await popup).url()).toContain('nexus.leonelrosado.dev')

  const download = page.waitForEvent('download')
  await chip(page, 'cv').click()
  expect((await download).suggestedFilename()).toBe('leonel-rosado-cv-en.pdf')
})

test('ls entries are clickable and keep working after moving elsewhere', async ({ page }) => {
  await run(page, 'cd projects')
  await run(page, 'ls')
  const nexus = page.locator('[role=log] li button', { hasText: 'nexus/' }).last()
  await run(page, 'cd ~/skills')
  await nexus.click()
  await expect(page.locator('header h1')).toHaveText('root@leonel-os: ~/projects/nexus')
})

test('unknown commands suggest the closest one', async ({ page }) => {
  await run(page, 'lss')
  await expect(output(page)).toContainText('command not found: lss')
  await expect(page.locator('[role=log] button', { hasText: /^ls$/ }).last()).toBeVisible()
})

test('extra arguments are rejected like zsh', async ({ page }) => {
  await run(page, 'open about.txt about.txt')
  await expect(output(page).locator('p').last()).toHaveText('open: too many arguments')
})

test('the contact form never sends without a key and offers the email instead', async ({ page }) => {
  // Never hit the real Web3Forms API from tests, even when a local .env has a key
  await page.route('https://api.web3forms.com/**', (route) => route.fulfill({ status: 500, json: { success: false } }))
  await chip(page, 'contact').click()
  await page.locator('[role=log] button', { hasText: 'send-message' }).last().click()
  for (const answer of ['Ana', 'ana@example.com', 'Hola, quiero cotizar un sitio', 'y']) {
    await page.locator(PROMPT_INPUT).fill(answer)
    await page.locator(PROMPT_INPUT).press('Enter')
  }
  await expect(output(page)).toContainText("Couldn't send it. Please email me directly:")
  await expect(page.locator('[role=log] a[href="mailto:leonelrosado2407@gmail.com"]').last()).toBeVisible()
})

test('the cancel chip aborts the contact form', async ({ page }) => {
  await run(page, 'send-message')
  await expect(page.locator('form span')).toHaveText('Your name:')
  await page.locator('nav button', { hasText: 'cancel' }).click()
  await expect(output(page)).toContainText('Message discarded.')
})

test('language and theme persist across reloads, and the tab icon follows the theme', async ({ page }) => {
  await run(page, 'theme dracula')
  await run(page, 'lang es')
  await expect(output(page)).toContainText('Idioma cambiado a español.')
  await page.reload()
  await expect(page.locator(PROMPT_INPUT)).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dracula')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  const icon = await page.locator('link[rel="icon"]').getAttribute('href')
  expect(decodeURIComponent(icon)).toContain('rgb(189 147 249)') // dracula accent
})

test('the phone layout never scrolls sideways, even deep in the tree', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout only')
  await run(page, 'cd ~/projects/dulce-tentacion/screenshots')
  await chip(page, 'contact').click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(393)
  const width = await page.locator(PROMPT_INPUT).evaluate((el) => el.getBoundingClientRect().width)
  expect(width).toBeGreaterThan(60)
})

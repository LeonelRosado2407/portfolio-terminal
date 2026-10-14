import { test, expect } from '@playwright/test'
import { PROMPT_INPUT, chip, openTerminal, output, run, scroller } from './helpers'

// Physical-keyboard behavior: suggestions, history, focus and scrolling
test.skip(({ isMobile }) => isMobile, 'desktop keyboard only')

const options = (page) => page.getByRole('option')

test.beforeEach(async ({ page }) => {
  await openTerminal(page)
})

test('typing shows suggestions with descriptions, and Enter still runs what was typed', async ({ page }) => {
  await page.keyboard.type('p')
  await expect(options(page).first()).toHaveText(/projects\s*my projects/)
  await page.keyboard.press('Enter')
  await expect(output(page)).toContainText('command not found: p')
})

test('arrows pick a suggestion, Enter accepts it, Tab accepts the highlighted one', async ({ page }) => {
  await page.keyboard.type('cd ')
  await expect(options(page)).toHaveText(['contact/', 'cv/', 'experience/', 'projects/', 'skills/'])
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('cd projects/')

  await page.locator(PROMPT_INPUT).fill('cat ab')
  await page.keyboard.press('Tab')
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('cat about.txt ')
})

test('suggestions stop once a command has all its arguments', async ({ page }) => {
  await run(page, 'cd skills')
  await page.locator(PROMPT_INPUT).fill('open back')
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab')
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('open backend.txt ')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})

test('easter eggs are never suggested', async ({ page }) => {
  await page.keyboard.type('mat')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})

test('up arrow walks the history without opening the list', async ({ page }) => {
  await run(page, 'pwd')
  await run(page, 'cd projects')
  await page.keyboard.press('ArrowUp')
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('cd projects')
  await page.keyboard.press('ArrowUp')
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('pwd')
  await expect(page.getByRole('listbox')).toHaveCount(0)
})

test('after clicking a command, typing goes straight to the prompt', async ({ page }) => {
  await chip(page, 'contact').click()
  await page.locator('[role=log] button', { hasText: 'send-message' }).last().click()
  await page.keyboard.type('Ana')
  await page.keyboard.press('Enter')
  await expect(output(page)).toContainText('Your name: Ana')
})

test('the prompt shows a visible focus ring', async ({ page }) => {
  const ring = await page.locator('form').evaluate((form) => getComputedStyle(form).boxShadow)
  expect(ring).toContain('0px 0px 0px 1px')
})

test('new output stays in view after the 500-line cap', async ({ page }) => {
  for (let i = 0; i < 70; i++) await run(page, 'skills')
  await scroller(page).evaluate((el) => (el.scrollTop = 0))
  await chip(page, 'help').click()
  await expect
    .poll(() => scroller(page).evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
    .toBeLessThan(5)
})

test('matrix rain covers the screen and the dismissing key is not typed', async ({ page }) => {
  await run(page, 'matrix')
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await page.keyboard.press('x')
  await expect(canvas).toHaveCount(0)
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('')
  await expect(output(page)).toContainText('Wake up, Neo')
})

import { test, expect } from '@playwright/test'
import { PROMPT_INPUT, chip, openTerminal, run } from './helpers'

const thumbnails = (page) => page.locator('[role=log] ul.grid button')
const viewer = (page) => page.getByRole('dialog')

test.beforeEach(async ({ page }) => {
  await openTerminal(page)
})

test('a project README shows its screenshots after two clicks', async ({ page }) => {
  await chip(page, 'projects').click()
  await page.locator('[role=log] dt button', { hasText: 'nexus/' }).last().click()
  await expect(thumbnails(page)).toHaveCount(4)
  await expect
    .poll(() =>
      page
        .locator('[role=log] ul.grid img')
        .evaluateAll((imgs) => imgs.every((img) => img.complete && img.naturalWidth > 0)),
    )
    .toBe(true)
})

test('the viewer opens, navigates with the keyboard and closes with Esc', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard navigation')
  await run(page, 'open ~/projects/nexus/screenshots')
  await thumbnails(page).nth(1).click()
  await expect(viewer(page)).toContainText('2 / 4')
  await page.keyboard.press('ArrowRight')
  await expect(viewer(page)).toContainText('3 / 4')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(viewer(page)).toContainText('4 / 4')
  await page.keyboard.press('Escape')
  await expect(viewer(page)).toHaveCount(0)
  await expect(thumbnails(page).nth(1)).toBeFocused()
  await expect(page.locator(PROMPT_INPUT)).toHaveValue('')
})

test('clicking outside the image closes the viewer', async ({ page }) => {
  await run(page, 'open ~/projects/nexus/screenshots')
  await thumbnails(page).first().click()
  await viewer(page).click({ position: { x: 5, y: 5 } })
  await expect(viewer(page)).toHaveCount(0)
})

test('the viewer buttons work on a phone', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch layout')
  await run(page, 'open ~/projects/dulce-tentacion/screenshots')
  await thumbnails(page).nth(2).click()
  await viewer(page).getByRole('button', { name: /Next/ }).click()
  await expect(viewer(page)).toContainText('4 / 4')
})

test('clicking screenshots/ in ls opens the gallery', async ({ page }) => {
  await run(page, 'ls ~/projects/dulce-tentacion')
  await page.locator('[role=log] li button', { hasText: 'screenshots/' }).last().click()
  await expect(thumbnails(page)).toHaveCount(4)
})

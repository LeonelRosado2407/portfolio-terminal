import { describe, it, expect } from 'vitest'
import { makeCtx, run } from '../../test/shell'
import { textOf } from '../../test/blocks'

describe('open', () => {
  it('opens .url files in a new tab and leaves a fallback link', async () => {
    const ctx = makeCtx()
    const out = await run('open projects/nexus/demo.url', ctx)
    expect(ctx.calls).toContainEqual(['openUrl', 'https://nexus.leonelrosado.dev'])
    expect(out).toContainEqual({
      type: 'link',
      label: 'https://nexus.leonelrosado.dev',
      href: 'https://nexus.leonelrosado.dev',
      download: false,
    })
  })

  it('opens absolute http(s) URLs', async () => {
    const ctx = makeCtx()
    await run('open https://example.com', ctx)
    expect(ctx.calls).toContainEqual(['openUrl', 'https://example.com'])
  })

  it('downloads PDFs', async () => {
    const ctx = makeCtx()
    const out = await run('open ~/cv/leonel-rosado-cv-es.pdf', ctx)
    expect(ctx.calls).toContainEqual(['download', '/cv/leonel-rosado-cv-es.pdf', 'leonel-rosado-cv-es.pdf'])
    expect(out).toContainEqual({
      type: 'link',
      label: 'leonel-rosado-cv-es.pdf',
      href: '/cv/leonel-rosado-cv-es.pdf',
      download: true,
    })
  })

  it('shows screenshots inline', async () => {
    const ctx = makeCtx()
    const [image] = await run('open projects/nexus/screenshots/hero.jpg', ctx)
    expect(image).toMatchObject({ type: 'image', alt: 'Nexus landing page hero' })
    expect(image.src).toMatch(/hero.*\.jpg/)
    expect(ctx.calls).toEqual([])
  })

  it('opens a screenshots folder as a gallery', async () => {
    const out = await run('open projects/nexus/screenshots', makeCtx())
    expect(out).toHaveLength(1)
    expect(out[0].type).toBe('gallery')
    expect(out[0].images.map((image) => image.alt)).toEqual([
      'Nexus landing page hero',
      'Pricing table with annual billing selected',
      'Demo request dialog',
      'Nexus on a phone',
    ])
  })

  it('shows text files like cat', async () => {
    expect(textOf(await run('open about.txt', makeCtx()))).toContain('About me')
  })

  it('rejects directories, missing paths and a missing operand', async () => {
    const [dirError, tryCd] = await run('open projects', makeCtx())
    expect(dirError.text).toBe('open: projects: nothing to open here')
    expect(tryCd.items).toEqual(['cd ~/projects && ls'])
    expect(textOf(await run('open nope', makeCtx()))).toBe('open: no such file or directory: nope')
    expect(textOf(await run('open', makeCtx()))).toBe('open: missing operand')
  })
})

describe('shortcuts', () => {
  it('about prints the bio from anywhere', async () => {
    const ctx = makeCtx({ cwd: '/root/skills' })
    expect(textOf(await run('about', ctx))).toContain('About me')
  })

  it('projects moves to ~/projects and shows the index', async () => {
    const ctx = makeCtx()
    const text = textOf(await run('projects', ctx))
    expect(ctx.cwd).toBe('/root/projects')
    expect(text).toContain('Dulce Tentación')
    expect(text).toContain('Recurring Payments & POS Pricing')
  })

  it('experience prints every role, newest first', async () => {
    const text = textOf(await run('experience', makeCtx()))
    expect(text.indexOf('Tire Base')).toBeLessThan(text.indexOf('Intersoft'))
    expect(text.indexOf('Intersoft')).toBeLessThan(text.indexOf('Web Developer Intern'))
  })

  it('skills prints every group', async () => {
    const text = textOf(await run('skills', makeCtx()))
    for (const title of ['Frontend', 'Backend', 'Testing & quality', 'Tools & workflow']) expect(text).toContain(title)
  })

  it('services prints the offer', async () => {
    expect(textOf(await run('services', makeCtx()))).toContain('Frontend development')
  })

  it('contact shows the email as a mailto link and offers the form', async () => {
    const out = await run('contact', makeCtx())
    const table = out.find((block) => block.type === 'table')
    expect(table.rows).toContainEqual({
      label: 'Email',
      value: 'leonelrosado2407@gmail.com',
      href: 'mailto:leonelrosado2407@gmail.com',
    })
    expect(out).toContainEqual({ type: 'actions', label: 'Send me a message right here:', items: ['send-message'] })
  })

  it('cv downloads the CV in the current language', async () => {
    const ctx = makeCtx({ locale: 'es' })
    await run('cv', ctx)
    expect(ctx.calls).toContainEqual(['download', '/cv/leonel-rosado-cv-es.pdf', 'leonel-rosado-cv-es.pdf'])
  })
})

describe('whoami / neofetch', () => {
  it('whoami names the human', async () => {
    expect(textOf(await run('whoami', makeCtx()))).toContain('Leonel Rosado')
  })

  it('neofetch shows the banner', async () => {
    const [banner] = await run('neofetch', makeCtx())
    expect(banner.type).toBe('banner')
    const text = textOf([banner])
    for (const piece of ['Leonel Rosado', 'Full-Stack Developer', 'Vue.js 3', 'Open to freelance projects']) {
      expect(text).toContain(piece)
    }
  })
})

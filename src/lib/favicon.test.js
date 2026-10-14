import { describe, it, expect } from 'vitest'
import { faviconHref, faviconSvg } from './favicon'

describe('favicon', () => {
  it('draws a terminal window with the palette colors', () => {
    const svg = faviconSvg({ bg: '10 14 10', accent: '80 250 123' })
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/)
    expect(svg).toContain('fill="rgb(10 14 10)"')
    expect(svg.match(/rgb\(80 250 123\)/g).length).toBe(3) // window border, ">" and "_"
  })

  it('returns an SVG data URL a <link rel="icon"> can use', () => {
    const href = faviconHref({ bg: '250 250 247', accent: '0 110 60' })
    expect(href.startsWith('data:image/svg+xml,')).toBe(true)
    expect(decodeURIComponent(href.slice('data:image/svg+xml,'.length))).toBe(
      faviconSvg({ bg: '250 250 247', accent: '0 110 60' }),
    )
  })
})

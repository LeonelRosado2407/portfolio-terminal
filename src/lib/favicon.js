// Browser-tab icon: a terminal window with a ">_" prompt, painted with the active palette

// bg / accent are the RGB triples stored in the --term-* CSS tokens ("10 14 10")
export function faviconSvg({ bg, accent }) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
    `<rect x="1" y="3" width="30" height="26" rx="5" fill="rgb(${bg})" stroke="rgb(${accent})" stroke-width="2"/>` +
    `<path d="M8 11l6 5-6 5" fill="none" stroke="rgb(${accent})" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M16 22h8" stroke="rgb(${accent})" stroke-width="2.5" stroke-linecap="round"/>` +
    '</svg>'
  )
}

export const faviconHref = (colors) => `data:image/svg+xml,${encodeURIComponent(faviconSvg(colors))}`

// Reads the tokens of the palette currently on <html data-theme> and points the tab icon at them
export function applyFavicon() {
  const styles = getComputedStyle(document.documentElement)
  const bg = styles.getPropertyValue('--term-bg').trim()
  const accent = styles.getPropertyValue('--term-accent').trim()
  const link = document.querySelector('link[rel="icon"]')
  if (link && bg && accent) {
    link.type = 'image/svg+xml'
    link.href = faviconHref({ bg, accent })
  }
}

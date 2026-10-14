import * as b from '../blocks'

// A folder made only of images (e.g. screenshots/) behaves like a photo album
export const isImageDir = (node) =>
  node.type === 'dir' && node.children.length > 0 && node.children.every((child) => child.type === 'link' && child.action === 'image')

export const galleryOf = (node) => b.gallery(node.children.map((child) => ({ src: child.href, alt: child.alt })))

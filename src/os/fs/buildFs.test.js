import { describe, it, expect } from 'vitest'
import { buildFs } from './buildFs'
import { getNode } from './path'
import { makeT } from '../../test/makeT'
import { textOf } from '../../test/blocks'

function paths(node, prefix = '') {
  const here = prefix + (node.name ? `/${node.name}` : '')
  if (node.type !== 'dir') return [here]
  return [here || '/', ...node.children.flatMap((child) => paths(child, here))]
}

describe('buildFs', () => {
  const en = buildFs(makeT('en'))
  const es = buildFs(makeT('es'))

  it('has the same paths in every language', () => {
    expect(paths(es)).toEqual(paths(en))
  })

  it('exposes the portfolio sections in the home directory', () => {
    const names = getNode(en, '/root').node.children.map((child) => child.name).sort()
    expect(names).toEqual(['.secrets', 'about.txt', 'contact', 'cv', 'experience', 'projects', 'services.txt', 'skills'])
  })

  it.each(['dulce-tentacion', 'nexus'])('gives %s a README, links and screenshots', (id) => {
    const project = getNode(en, `/root/projects/${id}`).node
    expect(project.children.map((child) => child.name)).toEqual(['README.md', 'demo.url', 'repo.url', 'screenshots'])
    const shots = project.children.find((child) => child.name === 'screenshots').children
    expect(shots).toHaveLength(4)
    shots.forEach((shot) => {
      expect(shot).toMatchObject({ type: 'link', action: 'image' })
      expect(shot.alt).toBeTruthy()
    })
  })

  it('lists every client project and experience entry', () => {
    expect(getNode(en, '/root/projects/client-work').node.children).toHaveLength(4)
    expect(getNode(en, '/root/experience').node.children.map((c) => c.name)).toEqual([
      '01-netlancers-intern.txt', '02-netlancers-jr.txt', '03-intersoft.txt', '04-tire-base.txt',
    ])
  })

  it.each(['dulce-tentacion', 'nexus'])('shows the %s screenshots as a gallery inside its README', (id) => {
    const readme = getNode(en, `/root/projects/${id}/README.md`).node
    const gallery = readme.content.find((block) => block.type === 'gallery')
    expect(gallery.images).toHaveLength(4)
    gallery.images.forEach((image) => {
      expect(image.src).toMatch(/\.jpg/)
      expect(image.alt).toBeTruthy()
    })
  })

  it('translates file contents', () => {
    expect(textOf(getNode(en, '/root/about.txt').node.content)).toContain('About me')
    expect(textOf(getNode(es, '/root/about.txt').node.content)).toContain('Acerca de mí')
  })

  it('makes the contact script executable and the CVs downloadable', () => {
    expect(getNode(en, '/root/contact/send-message.sh').node).toMatchObject({ type: 'exec', command: 'send-message' })
    expect(getNode(en, '/root/cv/leonel-rosado-cv-es.pdf').node).toMatchObject({
      type: 'link', action: 'download', href: '/cv/leonel-rosado-cv-es.pdf',
    })
  })
})

import { describe, it, expect } from 'vitest'
import { HOME, normalize, displayPath, getNode, resolve, joinPath, byName } from './path'

const tree = {
  type: 'dir',
  name: '',
  children: [
    {
      type: 'dir',
      name: 'root',
      children: [
        { type: 'file', name: 'about.txt', content: [] },
        { type: 'dir', name: 'projects', children: [{ type: 'dir', name: 'nexus', children: [] }] },
      ],
    },
  ],
}

describe('normalize', () => {
  it.each([
    ['/root', '', '/root'],
    ['/root', '.', '/root'],
    ['/root', 'projects', '/root/projects'],
    ['/root', 'projects/', '/root/projects'],
    ['/root', 'projects//nexus/', '/root/projects/nexus'],
    ['/root/projects', '..', '/root'],
    ['/root', '../../../..', '/'],
    ['/root/projects', '~', '/root'],
    ['/', '~/projects/../about.txt', '/root/about.txt'],
    ['/root/projects', '/root/./projects/nexus/..', '/root/projects'],
  ])('normalize(%s, %s) → %s', (cwd, input, expected) => {
    expect(normalize(cwd, input)).toBe(expected)
  })
})

describe('displayPath', () => {
  it('abbreviates the home directory only', () => {
    expect(displayPath(HOME)).toBe('~')
    expect(displayPath('/root/projects')).toBe('~/projects')
    expect(displayPath('/rootless')).toBe('/rootless')
    expect(displayPath('/')).toBe('/')
  })
})

describe('getNode / resolve', () => {
  it('finds nested nodes and returns their absolute path', () => {
    const found = resolve(tree, '/root', 'projects/nexus')
    expect(found.node.name).toBe('nexus')
    expect(found.path).toBe('/root/projects/nexus')
  })

  it('returns the tree itself for /', () => {
    expect(getNode(tree, '/').node).toBe(tree)
  })

  it('reports missing paths', () => {
    expect(resolve(tree, '/root', 'nope')).toEqual({ error: 'ENOENT' })
  })

  it('reports walking through a file', () => {
    expect(resolve(tree, '/root', 'about.txt/x')).toEqual({ error: 'ENOTDIR' })
  })
})

describe('joinPath / byName', () => {
  it('joins without doubling the slash at the root', () => {
    expect(joinPath('/', 'root')).toBe('/root')
    expect(joinPath('/root', 'cv')).toBe('/root/cv')
  })

  it('sorts by plain character order (dotfiles and capitals first, like ls)', () => {
    const names = ['skills', '.secrets', 'README.md', 'about.txt'].map((name) => ({ name }))
    expect(names.sort(byName).map((n) => n.name)).toEqual(['.secrets', 'README.md', 'about.txt', 'skills'])
  })
})

export const HOME = '/root'

// Turns any user path into a clean absolute path: handles ~, ., .., repeated and trailing slashes
export function normalize(cwd, input = '') {
  let raw = input
  if (raw === '~' || raw.startsWith('~/')) raw = HOME + raw.slice(1)
  const parts = raw.startsWith('/') ? [] : cwd.split('/').filter(Boolean)
  for (const part of raw.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return '/' + parts.join('/')
}

export function displayPath(path) {
  if (path === HOME) return '~'
  if (path.startsWith(HOME + '/')) return '~' + path.slice(HOME.length)
  return path
}

export function getNode(root, path) {
  let node = root
  for (const part of path.split('/').filter(Boolean)) {
    if (node.type !== 'dir') return { error: 'ENOTDIR' }
    node = node.children.find((child) => child.name === part)
    if (!node) return { error: 'ENOENT' }
  }
  return { node, path }
}

export function resolve(root, cwd, input) {
  return getNode(root, normalize(cwd, input))
}

export function joinPath(dir, name) {
  return dir === '/' ? `/${name}` : `${dir}/${name}`
}

// Plain code-point order, like `LC_ALL=C ls`: dotfiles, then capitals, then lowercase
export function byName(a, b) {
  if (a.name < b.name) return -1
  return a.name > b.name ? 1 : 0
}

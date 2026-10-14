import { byName, getNode, normalize } from '../fs/path'
import { splitFlags } from './parse'
import { argLimit, findCommand } from './run'

const MAX_SUGGESTIONS = 6

const commonPrefix = (words) =>
  words.reduce((prefix, word) => {
    let i = 0
    while (i < prefix.length && prefix[i] === word[i]) i++
    return prefix.slice(0, i)
  })

function pathCandidates(ctx, word, onlyDirs = false) {
  const slash = word.lastIndexOf('/')
  const dirPart = slash === -1 ? '' : word.slice(0, slash + 1)
  const base = word.slice(slash + 1)
  const { node } = getNode(ctx.fs, normalize(ctx.cwd, dirPart || '.'))
  if (!node || node.type !== 'dir') return []
  return node.children
    .filter((child) => child.name.startsWith(base) && (base.startsWith('.') || !child.name.startsWith('.')))
    .filter((child) => !onlyDirs || child.type === 'dir')
    .sort(byName)
    .map((child) =>
      child.type === 'dir'
        ? { value: `${dirPart}${child.name}/`, label: `${child.name}/`, final: false, kind: 'dir', detail: '' }
        : { value: `${dirPart}${child.name}`, label: child.name, final: true, kind: child.type, detail: '' },
    )
}

function commandCandidates(ctx, word) {
  if (word.includes('/')) return pathCandidates(ctx, word)
  const seen = new Set()
  return ctx.commands
    .filter((command) => !command.hidden)
    .flatMap((command) => [command.name, ...(command.aliases ?? [])].map((name) => ({ name, command })))
    .filter(({ name }) => name.startsWith(word) && !seen.has(name) && seen.add(name))
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .map(({ name, command }) => ({
      value: name,
      label: name,
      final: true,
      kind: 'command',
      detail: command.summary?.(ctx.t) ?? '',
    }))
}

// Arguments come from the command itself: `args(ctx)` for fixed values, `paths` ('dir' or true) for the tree
function argCandidates(ctx, [commandName, ...typed], word) {
  const command = findCommand(ctx.commands, commandName)
  if (!command || command.hidden) return []
  // Nothing more to offer once the command has all the operands it accepts
  if (splitFlags(typed.filter(Boolean)).operands.length >= argLimit(command)) return []
  if (command.args) {
    return command
      .args(ctx)
      .filter((value) => value.startsWith(word))
      .map((value) => ({ value, label: value, final: true, kind: 'option', detail: '' }))
  }
  if (command.paths) return pathCandidates(ctx, word, command.paths === 'dir')
  return []
}

// Candidates for the last space-separated word: a command name first, its arguments after that
function candidates(input, ctx) {
  const words = input.split(' ')
  const last = words.pop()
  const items = words.length === 0 ? commandCandidates(ctx, last) : argCandidates(ctx, words, last)
  return { words, items }
}

const accept = (words, item) => [...words, item.value + (item.final ? ' ' : '')].join(' ')

// Tab: complete a unique match, or extend to the common prefix and list the options
export function complete(input, ctx) {
  const { words, items } = candidates(input, ctx)
  if (!items.length) return { value: input, options: [] }
  if (items.length === 1) return { value: accept(words, items[0]), options: [] }
  const prefix = commonPrefix(items.map((item) => item.value))
  return { value: [...words, prefix].join(' '), options: items.map((item) => item.label) }
}

// As-you-type list: each suggestion carries the whole line it would produce
export function suggestions(input, ctx, limit = MAX_SUGGESTIONS) {
  if (!input.trim()) return []
  const { words, items } = candidates(input, ctx)
  return items.slice(0, limit).map((item) => ({
    value: accept(words, item),
    label: item.label,
    detail: item.detail,
    kind: item.kind,
  }))
}

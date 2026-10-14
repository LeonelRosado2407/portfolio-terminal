import * as b from '../blocks'
import { resolve } from '../fs/path'
import { parse, splitFlags } from './parse'
import { suggest } from './suggest'

const isAsyncIterator = (value) => value != null && typeof value[Symbol.asyncIterator] === 'function'

// How many operands (flags don't count) a command accepts. Easter eggs take anything;
// commands that declare `args` or `paths` take one unless they say otherwise; the rest take none.
export function argLimit(command) {
  if (command.maxArgs !== undefined) return command.maxArgs
  if (command.hidden) return Infinity
  return command.args || command.paths ? 1 : 0
}

export function findCommand(commands, name) {
  return commands.find((command) => command.name === name || command.aliases?.includes(name))
}

// Finds what to run: a registered command, or an executable file when the name is a path (./send-message.sh)
function lookup(name, ctx) {
  if (name.includes('/')) {
    const { node, error } = resolve(ctx.fs, ctx.cwd, name)
    const command = node?.type === 'exec' ? findCommand(ctx.commands, node.command) : null
    if (command) return { command }
    if (error || node.type === 'exec')
      return { blocks: [b.error(ctx.t('term.err.not_found', { cmd: 'zsh', path: name }))] }
    if (node.type === 'dir') return { blocks: [b.error(ctx.t('term.err.is_dir', { cmd: 'zsh', path: name }))] }
    return { blocks: [b.error(ctx.t('term.err.permission_denied', { cmd: 'zsh', path: name }))] }
  }

  const command = findCommand(ctx.commands, name)
  if (command) return { command }
  const visible = ctx.commands.filter((c) => !c.hidden).map((c) => c.name)
  const guess = suggest(name, visible)
  return {
    blocks: [
      b.error(ctx.t('term.err.command_not_found', { name })),
      guess ? b.actions(ctx.t('term.err.did_you_mean'), [guess]) : b.actions(ctx.t('term.try'), ['help']),
    ],
  }
}

// Runs one command; returns false when it failed so `&&` chains can stop
async function* runOne(line, ctx) {
  const parsed = parse(line)
  if (!parsed) return true
  const found = lookup(parsed.name, ctx)
  if (found.blocks) {
    yield* found.blocks
    return false
  }
  if (splitFlags(parsed.args).operands.length > argLimit(found.command)) {
    yield b.error(ctx.t('term.err.too_many_args', { cmd: parsed.name }))
    return false
  }
  try {
    const result = found.command.run(ctx, parsed.args, parsed.name)
    if (isAsyncIterator(result)) {
      yield* result
      return true
    }
    const blocks = (await result) ?? []
    yield* blocks
    return !blocks.some((block) => block.type === 'error')
  } catch {
    yield b.error(ctx.t('term.err.crashed', { cmd: parsed.name }))
    return false
  }
}

// Async generator: yields output blocks and { type: 'prompt' } requests; the caller sends answers back with next()
export async function* runLine(line, ctx) {
  for (const segment of line.split('&&')) {
    const ok = yield* runOne(segment, ctx)
    if (ok === false) return
  }
}

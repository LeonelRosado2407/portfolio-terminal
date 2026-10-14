import { buildFs } from '../os/fs/buildFs'
import { HOME } from '../os/fs/path'
import { commands } from '../os/commands'
import { runLine } from '../os/shell/run'
import { makeT } from './makeT'

// A fake ctx with real translations and fs; side effects are recorded in ctx.calls
export function makeCtx(overrides = {}) {
  const locale = overrides.locale ?? 'en'
  const t = makeT(locale)
  const ctx = {
    t,
    fs: buildFs(t),
    cwd: HOME,
    prevCwd: HOME,
    locale,
    theme: 'green',
    themes: ['green', 'amber', 'dracula', 'light'],
    history: [],
    commands,
    calls: [],
    setCwd(path) {
      ctx.prevCwd = ctx.cwd
      ctx.cwd = path
    },
    setLocale(next) {
      ctx.calls.push(['setLocale', next])
      ctx.locale = next
      ctx.t = makeT(next)
      ctx.fs = buildFs(ctx.t)
    },
    setTheme(name) { ctx.calls.push(['setTheme', name]) },
    openUrl(url) { ctx.calls.push(['openUrl', url]) },
    download(href, filename) { ctx.calls.push(['download', href, filename]) },
    clear() { ctx.calls.push(['clear']) },
    reboot() { ctx.calls.push(['reboot']) },
    matrix() { ctx.calls.push(['matrix']) },
    sendMessage: async () => ({ ok: true }),
    ...overrides,
  }
  return ctx
}

// Runs a line to completion, answering prompts from `answers` in order
export async function run(line, ctx, answers = []) {
  const queue = [...answers]
  const out = []
  const gen = runLine(line, ctx)
  let step = await gen.next()
  while (!step.done) {
    out.push(step.value)
    let reply
    if (step.value.type === 'prompt') {
      if (!queue.length) throw new Error(`Unexpected prompt: ${step.value.label}`)
      reply = queue.shift()
    }
    step = await gen.next(reply)
  }
  return out
}

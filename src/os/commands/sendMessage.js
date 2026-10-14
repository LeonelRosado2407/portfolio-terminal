import * as b from '../blocks'
import { contact } from '../../data/profile'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const YES = ['y', 'yes', 's', 'si', 'sí']

const required = (value) => (value ? null : 'required')
const validEmail = (value) => required(value) ?? (EMAIL.test(value) ? null : 'invalid_email')
const longEnough = (value) => required(value) ?? (value.length >= 10 ? null : 'too_short')

// Asks until the answer passes `validate`; returns the trimmed answer
async function* ask(ctx, key, validate) {
  for (;;) {
    const answer = ((yield b.prompt(ctx.t(`term.msg.${key}`))) ?? '').trim()
    const problem = validate(answer)
    if (!problem) return answer
    yield b.error(ctx.t(`term.msg.${problem}`))
  }
}

export default {
  name: 'send-message',
  aliases: ['message'],
  summary: (t) => t('term.cmd.send_message'),
  async *run(ctx) {
    yield b.text(ctx.t('term.msg.intro'), 'dim')
    const name = yield* ask(ctx, 'name', required)
    const email = yield* ask(ctx, 'email', validEmail)
    const message = yield* ask(ctx, 'message', longEnough)
    const confirm = ((yield b.prompt(ctx.t('term.msg.confirm'))) ?? '').trim().toLowerCase()
    if (!YES.includes(confirm)) {
      yield b.text(ctx.t('term.msg.discarded'), 'dim')
      return
    }
    yield b.text(ctx.t('term.msg.sending'), 'dim')
    const result = await ctx.sendMessage({ name, email, message, subject: ctx.t('term.msg.subject') })
    if (result.ok) {
      yield b.text(ctx.t('term.msg.sent'), 'ok')
    } else {
      yield b.error(ctx.t('term.msg.failed'))
      yield b.link(contact.email, `mailto:${contact.email}`)
    }
  },
}

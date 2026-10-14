import { describe, it, expect } from 'vitest'
import { makeCtx, run } from '../../test/shell'
import { textOf } from '../../test/blocks'

const good = ['Ana López', 'ana@example.com', 'Hola, quiero cotizar un sitio web', 'y']

function recordingCtx(result = { ok: true }, overrides = {}) {
  const sent = []
  const ctx = makeCtx({
    sendMessage: async (payload) => {
      sent.push(payload)
      return result
    },
    ...overrides,
  })
  return { ctx, sent }
}

describe('send-message', () => {
  it('collects name, email and message, then sends', async () => {
    const { ctx, sent } = recordingCtx()
    const out = await run('send-message', ctx, good)
    expect(out.filter((block) => block.type === 'prompt').map((block) => block.label)).toEqual([
      'Your name:',
      'Your email:',
      'Your message:',
      'Send it? (y/n):',
    ])
    expect(sent).toEqual([
      {
        name: 'Ana López',
        email: 'ana@example.com',
        message: 'Hola, quiero cotizar un sitio web',
        subject: 'New message from the leonel-os terminal',
      },
    ])
    expect(textOf(out)).toContain("Message sent! I'll reply within 24 hours.")
  })

  it('asks again until each answer is valid', async () => {
    const { ctx, sent } = recordingCtx()
    const out = await run('send-message', ctx, [
      '  ',
      'Ana',
      'nope',
      'ana@example.com',
      'short',
      'A longer message here',
      'y',
    ])
    const errors = out.filter((block) => block.type === 'error').map((block) => block.text)
    expect(errors).toEqual([
      'This field is required.',
      "That doesn't look like a valid email. Try again.",
      'Please write at least 10 characters.',
    ])
    expect(sent[0]).toMatchObject({ name: 'Ana', email: 'ana@example.com', message: 'A longer message here' })
  })

  it('discards the message when not confirmed', async () => {
    const { ctx, sent } = recordingCtx()
    const out = await run('send-message', ctx, [...good.slice(0, 3), 'n'])
    expect(sent).toEqual([])
    expect(textOf(out)).toContain('Message discarded.')
  })

  it('accepts a Spanish yes', async () => {
    const { ctx, sent } = recordingCtx({ ok: true }, { locale: 'es' })
    const out = await run('send-message', ctx, [...good.slice(0, 3), 'Sí'])
    expect(out.find((block) => block.type === 'prompt').label).toBe('Tu nombre:')
    expect(sent).toHaveLength(1)
  })

  it('offers the email address when sending fails', async () => {
    const { ctx } = recordingCtx({ ok: false, reason: 'HTTP 500' })
    const out = await run('send-message', ctx, good)
    expect(out).toContainEqual({ type: 'error', text: "Couldn't send it. Please email me directly:" })
    expect(out).toContainEqual({
      type: 'link',
      label: 'leonelrosado2407@gmail.com',
      href: 'mailto:leonelrosado2407@gmail.com',
      download: false,
    })
  })

  it('runs from the script path', async () => {
    const { ctx, sent } = recordingCtx()
    await run('cd contact', ctx)
    await run('./send-message.sh', ctx, good)
    expect(sent).toHaveLength(1)
  })
})

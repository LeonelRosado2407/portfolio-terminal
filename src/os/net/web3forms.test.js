import { describe, it, expect, vi } from 'vitest'
import { ENDPOINT, postMessage } from './web3forms'

const payload = { name: 'Ana', email: 'ana@example.com', message: 'Hola, quiero un sitio', subject: 'S' }
const fakeFetch = (status, body) => vi.fn(async () => ({ ok: status < 400, status, json: async () => body }))

describe('postMessage', () => {
  it('refuses to send without an access key', async () => {
    const fetchImpl = vi.fn()
    expect(await postMessage(payload, { accessKey: '', fetchImpl })).toEqual({ ok: false, reason: 'missing-key' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts the message as JSON and succeeds on success:true', async () => {
    const fetchImpl = fakeFetch(200, { success: true })
    expect(await postMessage(payload, { accessKey: 'KEY', fetchImpl })).toEqual({ ok: true })
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).toBe(ENDPOINT)
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toMatchObject({
      access_key: 'KEY', name: 'Ana', email: 'ana@example.com', message: 'Hola, quiero un sitio', subject: 'S', botcheck: false,
    })
  })

  it('treats 200 with success:false as a failure', async () => {
    const fetchImpl = fakeFetch(200, { success: false, message: 'Invalid access key' })
    expect(await postMessage(payload, { accessKey: 'KEY', fetchImpl })).toEqual({ ok: false, reason: 'Invalid access key' })
  })

  it('reports HTTP and network errors', async () => {
    expect(await postMessage(payload, { accessKey: 'KEY', fetchImpl: fakeFetch(500, null) }))
      .toEqual({ ok: false, reason: 'HTTP 500' })
    const offline = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    expect(await postMessage(payload, { accessKey: 'KEY', fetchImpl: offline })).toEqual({ ok: false, reason: 'Failed to fetch' })
  })

  it('gives up when the request hangs, so the terminal is never stuck', async () => {
    const hanging = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      // Without an abort signal this request never settles, like a stalled mobile connection
      signal?.addEventListener('abort', () => reject(signal.reason))
    }))
    const result = await postMessage(payload, { accessKey: 'KEY', fetchImpl: hanging, timeoutMs: 20 })
    expect(result.ok).toBe(false)
  }, 1000)
})

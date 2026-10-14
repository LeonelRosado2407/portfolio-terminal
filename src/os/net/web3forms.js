export const ENDPOINT = 'https://api.web3forms.com/submit'

export async function postMessage(
  { name, email, message, subject },
  { accessKey, fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {},
) {
  if (!accessKey) return { ok: false, reason: 'missing-key' }
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      // A stalled connection would otherwise keep the terminal busy (Ctrl+C is ignored while busy)
      signal: AbortSignal.timeout(timeoutMs),
      // No hidden honeypot field exists in an interactive prompt, so botcheck is always false
      body: JSON.stringify({ access_key: accessKey, subject, from_name: name, name, email, message, botcheck: false }),
    })
    const data = await res.json().catch(() => null)
    // Web3Forms can answer 200 with success:false (bad key, spam)
    if (res.ok && data?.success) return { ok: true }
    return { ok: false, reason: data?.message || `HTTP ${res.status}` }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

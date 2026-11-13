const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function base32Encode(bytes) {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

export function base32Decode(input) {
  const clean = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const output = []

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char)
    if (index === -1) continue
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

export function generateSecret(bytesLength = 20) {
  const bytes = new Uint8Array(bytesLength)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

export async function generateTOTP(secret, { period = 30, digits = 6, timestamp = Date.now() } = {}) {
  const key = base32Decode(secret)
  if (key.length === 0) return ''

  const counter = Math.floor(timestamp / 1000 / period)
  const counterBytes = new Uint8Array(8)
  let remaining = counter

  for (let i = 7; i >= 0; i -= 1) {
    counterBytes[i] = remaining & 0xff
    remaining = Math.floor(remaining / 256)
  }

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, counterBytes))
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  return String(binary % 10 ** digits).padStart(digits, '0')
}

export async function verifyTOTP(secret, token, { window = 6, period = 30, digits = 6 } = {}) {
  const normalized = String(token || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(normalized) || !secret) return false

  const now = Date.now()
  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = await generateTOTP(secret, {
      period,
      digits,
      timestamp: now + offset * period * 1000,
    })
    if (candidate === normalized) return true
  }

  return false
}

export function buildOtpauthUri({ secret, accountName, issuer = 'DayoPI' }) {
  const suffix = secret ? ` (${secret.slice(-4)})` : ''
  const label = encodeURIComponent(`${issuer}:${accountName}${suffix}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

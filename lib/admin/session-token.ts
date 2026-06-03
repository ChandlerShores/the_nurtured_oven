export const ADMIN_SESSION_COOKIE = "tno_admin_session"
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7

export function getAdminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim()
  return value ? value : undefined
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function hmacSha256Base64Url(
  message: string,
  secret: string
): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  return bytesToBase64Url(new Uint8Array(signature))
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function createAdminSessionTokenAsync(): Promise<string | null> {
  const secret = getAdminPassword()
  if (!secret) return null

  const issuedAt = Date.now()
  const nonceBytes = new Uint8Array(16)
  crypto.getRandomValues(nonceBytes)
  const nonce = bytesToBase64Url(nonceBytes)
  const payload = `${issuedAt}.${nonce}`
  const signature = await hmacSha256Base64Url(payload, secret)
  return `${payload}.${signature}`
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false
  const secret = getAdminPassword()
  if (!secret) return false

  const parts = token.split(".")
  if (parts.length !== 3) return false

  const [issuedAtStr, nonce, signature] = parts
  const issuedAt = Number(issuedAtStr)
  if (!Number.isFinite(issuedAt)) return false
  if (Date.now() - issuedAt > SESSION_MAX_AGE_SEC * 1000) return false

  const payload = `${issuedAtStr}.${nonce}`
  const expected = await hmacSha256Base64Url(payload, secret)
  return constantTimeEqual(signature, expected)
}

export const adminSessionMaxAgeSec = SESSION_MAX_AGE_SEC

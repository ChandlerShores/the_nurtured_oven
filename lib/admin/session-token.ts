export const ADMIN_SESSION_COOKIE = "tno_admin_session"
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 3
const MIN_ADMIN_PASSWORD_LENGTH = 12
const MIN_SESSION_SECRET_LENGTH = 32
const MAX_SESSION_TOKEN_LENGTH = 512
const CLOCK_SKEW_MS = 60_000

export function getAdminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim()
  if (!value || value.length < MIN_ADMIN_PASSWORD_LENGTH) return undefined
  return value
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Signing key for session cookies — never send to the client (Edge-safe). */
export async function getAdminSessionSecret(): Promise<string | undefined> {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim()
  if (dedicated && dedicated.length >= MIN_SESSION_SECRET_LENGTH) {
    return dedicated
  }

  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password || password.length < MIN_ADMIN_PASSWORD_LENGTH) return undefined

  const enc = new TextEncoder()
  const digest = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(`tno-admin-session-v1:${password}`)
  )
  return bytesToHex(new Uint8Array(digest))
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
  const secret = await getAdminSessionSecret()
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
  if (!token || token.length > MAX_SESSION_TOKEN_LENGTH) return false
  const secret = await getAdminSessionSecret()
  if (!secret) return false

  const parts = token.split(".")
  if (parts.length !== 3) return false

  const [issuedAtStr, nonce, signature] = parts
  if (!issuedAtStr || !nonce || !signature) return false
  if (!/^\d+$/.test(issuedAtStr)) return false
  if (!/^[\w-]+$/.test(nonce) || !/^[\w-]+$/.test(signature)) return false

  const issuedAt = Number(issuedAtStr)
  if (!Number.isFinite(issuedAt)) return false
  const now = Date.now()
  if (issuedAt > now + CLOCK_SKEW_MS) return false
  if (now - issuedAt > SESSION_MAX_AGE_SEC * 1000) return false

  const payload = `${issuedAtStr}.${nonce}`
  const expected = await hmacSha256Base64Url(payload, secret)
  return constantTimeEqual(signature, expected)
}

export const adminSessionMaxAgeSec = SESSION_MAX_AGE_SEC

/** HTTPS URLs we trust for redirects and email buttons (Square checkout / receipts). */
const TRUSTED_HOSTS = new Set([
  "square.link",
  "checkout.square.site",
  "square.site",
])

const TRUSTED_HOST_SUFFIXES = [".square.link", ".squareup.com", ".square.site"]

export function isAllowedHttpsExternalUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (parsed.protocol !== "https:") return false

  const host = parsed.hostname.toLowerCase()
  if (TRUSTED_HOSTS.has(host)) return true

  return TRUSTED_HOST_SUFFIXES.some(
    (suffix) => host.endsWith(suffix) && host.length > suffix.length
  )
}

export function isAllowedCheckoutUrl(url: string): boolean {
  return isAllowedHttpsExternalUrl(url)
}

import { randomBytes } from "crypto"

const REF_PREFIX = "TNO"
const SUFFIX_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/** Random 5-char suffix (no ambiguous 0/O/1/I). */
export function generateInternalRefSuffix(length = 5): string {
  const bytes = randomBytes(length)
  let suffix = ""
  for (let i = 0; i < length; i++) {
    suffix += SUFFIX_ALPHABET[bytes[i]! % SUFFIX_ALPHABET.length]
  }
  return suffix
}

/**
 * Human-readable weekly order reference for Square referenceId and emails.
 * Example: TNO-2026-05-30-A8F3K2 (max 40 chars for Square referenceId).
 */
export function generateInternalRef(fulfillmentDate: string): string {
  return `${REF_PREFIX}-${fulfillmentDate}-${generateInternalRefSuffix()}`
}

export function isInternalRef(value: string): boolean {
  return /^TNO-\d{4}-\d{2}-\d{2}-[A-Z2-9]{5}$/.test(value.trim())
}

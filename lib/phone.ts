/**
 * Square Payment Links require buyer phone in E.164 (e.g. +18595551234).
 * Returns undefined when the value cannot be normalized so checkout still proceeds.
 */
export function formatPhoneForSquare(
  phone: string | undefined
): string | undefined {
  if (!phone?.trim()) return undefined

  const trimmed = phone.trim()
  const digits = trimmed.replace(/\D/g, "")

  if (digits.length === 10) {
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }

  if (trimmed.startsWith("+") && digits.length >= 11) {
    return `+${digits}`
  }

  return undefined
}

export function extractHouseNumber(address: string): string | null {
  const match = address.trim().match(/^(\d+[A-Za-z]?(-\d+)?)\b/)
  return match?.[1] ?? null
}

export function formatDeliveryAddress(
  address: string,
  city: string,
  zip?: string
): string {
  const parts = [address.trim(), city.trim(), zip?.trim()].filter(Boolean)
  return parts.join(", ")
}

export function hasDeliveryStreetAddress(address: string): boolean {
  return Boolean(address.trim())
}

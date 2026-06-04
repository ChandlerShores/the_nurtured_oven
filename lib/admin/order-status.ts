export const ORDER_STATUS_OPTIONS = [
  "New",
  "Baking",
  "Packed",
  "Ready",
  "Delivered / Picked Up",
  "Complete",
  "Cancelled",
  "Issue",
  "Refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]

/** Legacy sheet values mapped to canonical statuses. */
export const LEGACY_ORDER_STATUS_ALIASES: Record<string, OrderStatus> = {
  Delivered: "Delivered / Picked Up",
}

export function normalizeOrderStatus(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "New"
  return LEGACY_ORDER_STATUS_ALIASES[trimmed] ?? trimmed
}

export function isValidOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_OPTIONS as readonly string[]).includes(value)
}

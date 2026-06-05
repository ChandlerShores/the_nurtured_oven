export const ORDER_STATUS_IN_PROGRESS = "In progress" as const

export const ORDER_STATUS_OPTIONS = [
  "New",
  ORDER_STATUS_IN_PROGRESS,
  "Ready",
  "Delivered / Picked Up",
  "Cancelled",
  "Issue",
  "Refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]

/** Legacy sheet values mapped to canonical statuses. */
export const LEGACY_ORDER_STATUS_ALIASES: Record<string, OrderStatus> = {
  Delivered: "Delivered / Picked Up",
  Baking: ORDER_STATUS_IN_PROGRESS,
  Packed: ORDER_STATUS_IN_PROGRESS,
  Complete: "Delivered / Picked Up",
}

export function normalizeOrderStatus(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "New"
  return LEGACY_ORDER_STATUS_ALIASES[trimmed] ?? trimmed
}

export function isValidOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_OPTIONS as readonly string[]).includes(value)
}

/** Statuses that must not be overwritten by bulk “mark ready” (and similar). */
export const TERMINAL_ORDER_STATUSES = new Set<string>([
  "Delivered / Picked Up",
  "Delivered",
  "Complete",
  "Refunded",
  "Cancelled",
  "Issue",
])

export function isTerminalOrderStatus(status: string): boolean {
  const normalized = normalizeOrderStatus(status)
  return TERMINAL_ORDER_STATUSES.has(normalized)
}

export function canBulkSetStatusToReady(status: string): boolean {
  const normalized = normalizeOrderStatus(status)
  if (isTerminalOrderStatus(normalized)) return false
  return normalized !== "Ready"
}

export function canBulkSetStatusToInProgress(status: string): boolean {
  const normalized = normalizeOrderStatus(status)
  if (isTerminalOrderStatus(normalized)) return false
  if (normalized === ORDER_STATUS_IN_PROGRESS) return false
  if (normalized === "Ready") return false
  return true
}

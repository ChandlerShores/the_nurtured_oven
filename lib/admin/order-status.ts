export const ORDER_STATUS_OPTIONS = [
  "New",
  "Baking",
  "Packed",
  "Ready",
  "Delivered",
  "Complete",
  "Issue",
  "Refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number]

export function isValidOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_OPTIONS as readonly string[]).includes(value)
}

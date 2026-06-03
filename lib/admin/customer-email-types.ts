export const CUSTOMER_EMAIL_TYPES = [
  "ready_pickup",
  "out_for_delivery",
  "custom",
] as const

export type CustomerEmailType = (typeof CUSTOMER_EMAIL_TYPES)[number]

export function isCustomerEmailType(value: string): value is CustomerEmailType {
  return (CUSTOMER_EMAIL_TYPES as readonly string[]).includes(value)
}

export function customerEmailTypeLabel(type: CustomerEmailType): string {
  switch (type) {
    case "ready_pickup":
      return "Ready for Pickup"
    case "out_for_delivery":
      return "Out for Delivery"
    case "custom":
      return "Custom Message"
    default:
      return type
  }
}

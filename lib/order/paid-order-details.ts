export interface PaidOrderLineItem {
  name: string
  quantity: number
  slug?: string
  type?: "menu_item" | "delivery_fee"
  unitPriceCents?: number
  lineTotalCents?: number
}

export interface PaidOrderDetails {
  internalRef?: string
  fulfillmentMethod: "pickup" | "delivery"
  fulfillmentDate?: string
  batchLabel?: string
  orderWeek?: string
  menuCycle?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  lineItems: PaidOrderLineItem[]
  deliveryCity?: string
  deliveryAddress?: string
  dietary?: string
  message?: string
  subtotalCents?: number
  deliveryFeeCents?: number
  amountCents?: number
  squareOrderId?: string
  receiptUrl?: string
  /** Sheet export only; defaults to "New" when unset. */
  orderStatus?: string
}

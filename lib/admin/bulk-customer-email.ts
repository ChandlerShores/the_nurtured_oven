import {
  customerEmailTypeLabel,
  type CustomerEmailType,
} from "@/lib/admin/customer-email-types"
import { validateOrderForCustomerEmail } from "@/lib/admin/customer-order-email-validation"
import { sendCustomerOrderEmail } from "@/lib/admin/send-customer-order-email"
import type { CustomerEmailLogRow } from "@/lib/google-sheets/customer-emails"
import { fetchAllCustomerEmailLogs } from "@/lib/google-sheets/customer-emails"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import { normalizeOrderStatus } from "@/lib/admin/order-status"
import { isReadyForPickupStatus } from "@/lib/pickup/pickup-orders"
import { isPaidDeliveryOrder, isActiveDeliveryStop } from "@/lib/delivery/delivery-orders"
import { isPaidPickupOrder } from "@/lib/pickup/pickup-orders"

export type BulkEmailFulfillmentFilter = "pickup" | "delivery"

export interface BulkCustomerEmailFilters {
  type: CustomerEmailType
  fulfillment: BulkEmailFulfillmentFilter
  /** Order statuses eligible for this bulk action. */
  statuses: string[]
}

export interface BulkEmailCandidate {
  internalRef: string
  customerName: string
  customerEmail: string
  orderStatus: string
  skipReason?: "already_sent" | "invalid"
  skipDetail?: string
}

export interface BulkEmailPreview {
  type: CustomerEmailType
  typeLabel: string
  fulfillment: BulkEmailFulfillmentFilter
  eligible: BulkEmailCandidate[]
  alreadySent: BulkEmailCandidate[]
  skipped: BulkEmailCandidate[]
  sendCount: number
}

function logMatchesType(row: CustomerEmailLogRow, type: CustomerEmailType): boolean {
  const label = customerEmailTypeLabel(type)
  return row.emailType.trim() === label || row.emailType.trim() === type
}

function sentTypesForRef(
  history: CustomerEmailLogRow[],
  internalRef: string
): Set<CustomerEmailType> {
  const types = new Set<CustomerEmailType>()
  for (const row of history) {
    if (row.internalRef !== internalRef) continue
    if (row.sentStatus.toLowerCase().includes("fail")) continue
    if (logMatchesType(row, "ready_pickup")) types.add("ready_pickup")
    if (logMatchesType(row, "out_for_delivery")) types.add("out_for_delivery")
    if (logMatchesType(row, "custom")) types.add("custom")
  }
  return types
}

export function bulkFiltersForType(
  type: CustomerEmailType
): BulkCustomerEmailFilters | null {
  switch (type) {
    case "ready_pickup":
      return {
        type,
        fulfillment: "pickup",
        statuses: ["Ready"],
      }
    case "out_for_delivery":
      return {
        type,
        fulfillment: "delivery",
        statuses: ["Ready", "In progress"],
      }
    default:
      return null
  }
}

function orderMatchesBulkFilters(
  order: AdminOrderRow,
  filters: BulkCustomerEmailFilters
): boolean {
  const status = normalizeOrderStatus(order.orderStatus)
  if (!filters.statuses.includes(status)) return false
  if (filters.fulfillment === "pickup") {
    return isPaidPickupOrder(order) && isReadyForPickupStatus(status)
  }
  return isPaidDeliveryOrder(order) && isActiveDeliveryStop(status)
}

export function buildBulkEmailPreview(
  orders: AdminOrderRow[],
  type: CustomerEmailType,
  history: CustomerEmailLogRow[]
): BulkEmailPreview | null {
  const filters = bulkFiltersForType(type)
  if (!filters) return null

  const eligible: BulkEmailCandidate[] = []
  const alreadySent: BulkEmailCandidate[] = []
  const skipped: BulkEmailCandidate[] = []

  for (const order of orders) {
    if (!orderMatchesBulkFilters(order, filters)) continue

    const base = {
      internalRef: order.internalRef,
      customerName: order.customerName.trim() || "Customer",
      customerEmail: order.customerEmail.trim(),
      orderStatus: order.orderStatus.trim(),
    }

    const validationError = validateOrderForCustomerEmail(order)
    if (validationError) {
      skipped.push({
        ...base,
        skipReason: "invalid",
        skipDetail: validationError,
      })
      continue
    }

    const sent = sentTypesForRef(history, order.internalRef)
    if (sent.has(type)) {
      alreadySent.push({
        ...base,
        skipReason: "already_sent",
        skipDetail: `${customerEmailTypeLabel(type)} already logged`,
      })
      continue
    }

    eligible.push(base)
  }

  return {
    type,
    typeLabel: customerEmailTypeLabel(type),
    fulfillment: filters.fulfillment,
    eligible,
    alreadySent,
    skipped,
    sendCount: eligible.length,
  }
}

export interface BulkEmailSendResult {
  sent: number
  skipped: number
  failed: { internalRef: string; error: string }[]
}

const BULK_SEND_DELAY_MS = 400

export async function sendBulkCustomerEmails(
  internalRefs: string[],
  type: CustomerEmailType
): Promise<BulkEmailSendResult> {
  const result: BulkEmailSendResult = {
    sent: 0,
    skipped: 0,
    failed: [],
  }

  for (let i = 0; i < internalRefs.length; i++) {
    const internalRef = internalRefs[i]?.trim()
    if (!internalRef) continue

    if (i > 0) {
      await new Promise((r) => setTimeout(r, BULK_SEND_DELAY_MS))
    }

    const send = await sendCustomerOrderEmail({ internalRef, type })
    if (send.ok) {
      if (send.skipped) result.skipped += 1
      else result.sent += 1
    } else {
      result.failed.push({
        internalRef,
        error: send.error ?? "Send failed",
      })
    }
  }

  return result
}

export async function loadBulkEmailPreview(
  orders: AdminOrderRow[],
  type: CustomerEmailType
): Promise<BulkEmailPreview | null> {
  const history = await fetchAllCustomerEmailLogs()
  return buildBulkEmailPreview(orders, type, history)
}

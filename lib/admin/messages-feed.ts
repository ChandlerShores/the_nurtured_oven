import type { CustomerEmailLogRow } from "@/lib/google-sheets/customer-emails"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

export type MessageDeliveryStatus = "sent" | "failed" | "skipped" | "other"

export interface MessageFeedItem {
  id: string
  log: CustomerEmailLogRow
  order?: AdminOrderRow
  deliveryStatus: MessageDeliveryStatus
}

export interface MessageFeedStats {
  total: number
  sent: number
  failed: number
  skipped: number
}

export function classifyEmailDeliveryStatus(sentStatus: string): MessageDeliveryStatus {
  const lower = sentStatus.trim().toLowerCase()
  if (lower.includes("fail")) return "failed"
  if (lower.includes("skip") || lower.includes("not configured")) return "skipped"
  if (lower === "sent") return "sent"
  return "other"
}

export function buildMessageFeed(
  logs: CustomerEmailLogRow[],
  orders: AdminOrderRow[]
): MessageFeedItem[] {
  const orderByRef = new Map(
    orders
      .filter((o) => o.internalRef.trim())
      .map((o) => [o.internalRef.trim(), o] as const)
  )
  const weekRefs = new Set(orderByRef.keys())

  return logs
    .filter((log) => weekRefs.has(log.internalRef.trim()))
    .map((log) => {
      const ref = log.internalRef.trim()
      return {
        id: `${ref}-${log.timestamp}-${log.subject}`,
        log,
        order: orderByRef.get(ref),
        deliveryStatus: classifyEmailDeliveryStatus(log.sentStatus),
      }
    })
    .sort((a, b) => b.log.timestamp.localeCompare(a.log.timestamp))
}

export function computeMessageFeedStats(items: MessageFeedItem[]): MessageFeedStats {
  const stats: MessageFeedStats = {
    total: items.length,
    sent: 0,
    failed: 0,
    skipped: 0,
  }
  for (const item of items) {
    if (item.deliveryStatus === "sent") stats.sent += 1
    else if (item.deliveryStatus === "failed") stats.failed += 1
    else if (item.deliveryStatus === "skipped") stats.skipped += 1
  }
  return stats
}

export function messageMatchesSearch(item: MessageFeedItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    item.log.customerName,
    item.log.customerEmail,
    item.log.internalRef,
    item.log.emailType,
    item.log.subject,
    item.log.message,
    item.log.sentStatus,
    item.order?.fulfillmentMethod ?? "",
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

export function messageMatchesTypeFilter(
  item: MessageFeedItem,
  typeFilter: string
): boolean {
  if (!typeFilter || typeFilter === "all") return true
  const label = item.log.emailType.trim().toLowerCase()
  if (typeFilter === "ready_pickup") {
    return label.includes("ready") && label.includes("pickup")
  }
  if (typeFilter === "out_for_delivery") {
    return label.includes("delivery") || label.includes("out for")
  }
  if (typeFilter === "custom") {
    return label.includes("custom")
  }
  return true
}

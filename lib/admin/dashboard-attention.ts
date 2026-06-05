import {
  deliveryWord,
  isAre,
  orderWord,
  pickupWord,
} from "@/lib/admin/dashboard-copy"
import type { DashboardWeekPhase } from "@/lib/admin/dashboard-week-context"
import type { DashboardStats } from "@/lib/admin/dashboard-stats"
import {
  getFulfillmentDayPhase,
  getPrepUrgency,
} from "@/lib/admin/prep-deadline"

export type AttentionPriority = "critical" | "high" | "medium"

export interface DashboardAttentionItem {
  id: string
  priority: AttentionPriority
  headline: string
  context: string
  actionLabel: string
  href: string
}

export interface DashboardAttentionOptions {
  /** Countdown is shown in the page header when the window is open. */
  orderingClosesIn?: string | null
  weekPhase?: DashboardWeekPhase
  now?: Date
}

export interface DashboardAttentionSection {
  items: DashboardAttentionItem[]
  /** Plain-language summary when there is nothing to do. */
  calmMessage: string | null
  /** Short “all clear” lines for items that are not blocking. */
  allClear: string[]
}

const MAX_ITEMS = 4

const priorityRank: Record<AttentionPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
}

function newOrdersHeadline(count: number): string {
  return `${count} ${orderWord(count)} ${isAre(count)} still New`
}

function newOrdersContext(
  prep: ReturnType<typeof getPrepUrgency>,
  phase: DashboardWeekPhase
): string {
  if (phase === "ordering_open") {
    return "Review each order and move to In progress as they come in"
  }
  if (prep === "passed") {
    return "Move them to In progress — Wednesday prep cutoff has passed"
  }
  if (prep === "today") {
    return "Move them to In progress before today’s noon prep deadline"
  }
  if (prep === "soon") {
    return "Move them to In progress before tomorrow’s prep deadline"
  }
  return "Move them to In progress before Wednesday noon prep"
}

function newOrdersPriority(
  prep: ReturnType<typeof getPrepUrgency>,
  phase: DashboardWeekPhase
): AttentionPriority {
  if (prep === "passed" || prep === "today") return "critical"
  if (phase === "ordering_open") return "high"
  return "high"
}

function calmMessageForPhase(
  stats: DashboardStats,
  phase: DashboardWeekPhase
): string {
  switch (phase) {
    case "ordering_open":
      if (stats.newOrders > 0) {
        return null
      }
      return "No blockers on your list — watch for new orders as the window stays open."
    case "prep_soon":
    case "prep_day":
      return `You’re on track for ${stats.batchLabel}.`
    case "after_prep":
      return `Ordering is closed for ${stats.batchLabel}. Focus on production and fulfillment.`
    case "bake_day":
      return `Bake day for ${stats.batchLabel} — nothing else needs your attention right now.`
    case "after_bake":
      return `${stats.batchLabel} is wrapped.`
  }
}

export function buildDashboardAttention(
  stats: DashboardStats,
  options: DashboardAttentionOptions = {}
): DashboardAttentionSection {
  const now = options.now ?? new Date()
  const prep = getPrepUrgency(stats.fulfillmentDate, now)
  const fulfillmentPhase = getFulfillmentDayPhase(stats.fulfillmentDate, now)
  const phase = options.weekPhase ?? "after_prep"
  const candidates: DashboardAttentionItem[] = []

  if (stats.missingAddressCount > 0) {
    const n = stats.missingAddressCount
    candidates.push({
      id: "missing-addresses",
      priority: "critical",
      headline: `${n} ${deliveryWord(n)} ${isAre(n)} missing an address`,
      context: "Add street and ZIP before you run the Friday route",
      actionLabel: "Deliveries",
      href: "/admin/deliveries",
    })
  }

  if (stats.unpaidCount > 0) {
    const n = stats.unpaidCount
    candidates.push({
      id: "unpaid-orders",
      priority: "critical",
      headline: `${n} ${orderWord(n)} ${isAre(n)} not marked paid`,
      context: "Confirm payment in Square, then refresh Orders",
      actionLabel: "Orders",
      href: "/admin/orders?attention=unpaid",
    })
  }

  if (stats.issueCount > 0) {
    const n = stats.issueCount
    candidates.push({
      id: "issue-orders",
      priority: "critical",
      headline: `${n} ${orderWord(n)} ${isAre(n)} flagged Issue`,
      context: "Contact the customer and update the order when resolved",
      actionLabel: "Orders",
      href: "/admin/orders?status=Issue",
    })
  }

  if (stats.newOrders > 0) {
    candidates.push({
      id: "new-orders",
      priority: newOrdersPriority(prep, phase),
      headline: newOrdersHeadline(stats.newOrders),
      context: newOrdersContext(prep, phase),
      actionLabel: "Review New orders",
      href: "/admin/orders?status=New",
    })
  }

  if (fulfillmentPhase === "today") {
    if (stats.readyPickupCount > 0) {
      const n = stats.readyPickupCount
      candidates.push({
        id: "pickup-ready",
        priority: "medium",
        headline: `${n} ${pickupWord(n)} ${isAre(n)} Ready`,
        context: "Send the ready-for-pickup email when bags are set",
        actionLabel: "Pickup",
        href: "/admin/pickup",
      })
    }

    if (stats.readyDeliveryCount > 0) {
      const n = stats.readyDeliveryCount
      candidates.push({
        id: "delivery-ready",
        priority: "medium",
        headline: `${n} ${deliveryWord(n)} ${isAre(n)} Ready`,
        context: "Send out-for-delivery, then start the route",
        actionLabel: "Deliveries",
        href: "/admin/deliveries",
      })
    }

    if (stats.deliveriesNotDelivered > 0) {
      const n = stats.deliveriesNotDelivered
      candidates.push({
        id: "deliveries-open",
        priority: "high",
        headline: `${n} ${deliveryWord(n)} not marked delivered`,
        context: "Mark each stop delivered when you finish",
        actionLabel: "Deliveries",
        href: "/admin/deliveries",
      })
    }
  }

  const sorted = candidates.sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  )
  const newOrdersItem = sorted.find((i) => i.id === "new-orders")
  const withoutNew = sorted.filter((i) => i.id !== "new-orders")
  const items = newOrdersItem
    ? [newOrdersItem, ...withoutNew.slice(0, MAX_ITEMS - 1)]
    : withoutNew.slice(0, MAX_ITEMS)

  const calmMessage =
    items.length === 0 ? calmMessageForPhase(stats, phase) : null

  const allClear: string[] = []
  if (stats.missingAddressCount === 0 && stats.deliveryCount > 0) {
    allClear.push("All delivery addresses on file")
  }
  if (stats.unpaidCount === 0) {
    allClear.push("All orders marked paid")
  }
  if (stats.newOrders === 0) {
    allClear.push("No orders stuck at New")
  }
  if (stats.issueCount === 0) {
    allClear.push("No issue orders")
  }
  if (
    fulfillmentPhase === "today" &&
    stats.deliveryCount > 0 &&
    stats.deliveriesNotDelivered === 0
  ) {
    allClear.push("All deliveries marked done")
  }

  return { items, calmMessage, allClear }
}

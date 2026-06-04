import type { DashboardStats } from "@/lib/admin/dashboard-stats"
import { formatPrepDeadlineDisplay } from "@/lib/admin/prep-deadline"

export type AttentionPriority = "critical" | "high" | "medium"

export interface DashboardAttentionItem {
  id: string
  priority: AttentionPriority
  headline: string
  context: string
  actionLabel: string
  href: string
}

export interface DashboardAttentionSection {
  featured: DashboardAttentionItem
  active: DashboardAttentionItem[]
  allClear: string[]
}

const MAX_ACTIVE = 3

export function buildDashboardAttention(
  stats: DashboardStats
): DashboardAttentionSection {
  const prep = formatPrepDeadlineDisplay(stats.fulfillmentDate)

  const featured: DashboardAttentionItem = {
    id: "prep-deadline",
    priority: "critical",
    headline: prep.headline,
    context: prep.relativeLine
      ? `${prep.relativeLine} · ${prep.context}`
      : prep.context,
    actionLabel: "Open production",
    href: "/admin/production",
  }

  const candidates: DashboardAttentionItem[] = []

  if (stats.newOrders > 0) {
    candidates.push({
      id: "new-orders",
      priority: "medium",
      headline: `${stats.newOrders} new order${stats.newOrders === 1 ? "" : "s"}`,
      context: "Review before prep starts",
      actionLabel: "Review orders",
      href: "/admin/orders",
    })
  }

  if (stats.deliveriesStillOut > 0) {
    candidates.push({
      id: "deliveries-out",
      priority: "high",
      headline: `${stats.deliveriesStillOut} deliver${stats.deliveriesStillOut === 1 ? "y" : "ies"} still out`,
      context: "Route still active",
      actionLabel: "Open deliveries",
      href: "/admin/deliveries",
    })
  }

  if (stats.missingAddressCount > 0) {
    candidates.push({
      id: "missing-addresses",
      priority: "critical",
      headline: `${stats.missingAddressCount} missing address${stats.missingAddressCount === 1 ? "" : "es"}`,
      context: "Contact customer before Friday route",
      actionLabel: "Fix addresses",
      href: "/admin/deliveries",
    })
  }

  if (stats.unpaidCount > 0) {
    candidates.push({
      id: "unpaid-orders",
      priority: "critical",
      headline: `${stats.unpaidCount} unpaid order${stats.unpaidCount === 1 ? "" : "s"}`,
      context: "Verify Square payment state",
      actionLabel: "Review payments",
      href: "/admin/orders",
    })
  }

  const priorityRank: Record<AttentionPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
  }

  const active = candidates
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, MAX_ACTIVE)

  const allClear: string[] = []
  if (stats.missingAddressCount === 0) {
    allClear.push("No missing addresses")
  }
  if (stats.unpaidCount === 0) {
    allClear.push("No unpaid orders")
  }
  if (stats.newOrders === 0) {
    allClear.push("No new orders waiting")
  }
  if (stats.deliveriesStillOut === 0 && stats.deliveryCount > 0) {
    allClear.push("All deliveries complete")
  }

  return { featured, active, allClear }
}

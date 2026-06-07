"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import AdminMessagesComposer from "@/components/admin/AdminMessagesComposer"
import AdminCollapsibleFilters from "@/components/admin/ui/AdminCollapsibleFilters"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import MetricStrip from "@/components/admin/ui/MetricStrip"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { validateOrderForCustomerEmail } from "@/lib/admin/customer-order-email-validation"
import type {
  MessageFeedItem,
  MessageFeedStats,
} from "@/lib/admin/messages-feed"
import {
  messageMatchesSearch,
  messageMatchesTypeFilter,
} from "@/lib/admin/messages-feed"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "ready_pickup", label: "Pickup" },
  { id: "out_for_delivery", label: "Delivery" },
  { id: "custom", label: "Custom" },
] as const

function statusBadgeClass(status: MessageFeedItem["deliveryStatus"]): string {
  switch (status) {
    case "sent":
      return "bg-sage/20 text-espresso border-sage/40"
    case "failed":
      return "bg-red-50 text-red-900 border-red-200"
    case "skipped":
      return "bg-warm-honey/20 text-espresso border-warm-honey/50"
    default:
      return "bg-linen text-espresso border-espresso/20"
  }
}

function statusLabel(status: MessageFeedItem["deliveryStatus"]): string {
  switch (status) {
    case "sent":
      return "Sent"
    case "failed":
      return "Failed"
    case "skipped":
      return "Logged only"
    default:
      return "Other"
  }
}

interface AdminMessagesViewProps {
  orders: AdminOrderRow[]
  items: MessageFeedItem[]
  stats: MessageFeedStats
  batchLabel: string
}

export default function AdminMessagesView({
  orders,
  items,
  stats,
  batchLabel,
}: AdminMessagesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [composeRef, setComposeRef] = useState<string | undefined>(undefined)

  const sendableRefSet = useMemo(() => {
    const refs = new Set<string>()
    for (const order of orders) {
      if (!validateOrderForCustomerEmail(order)) {
        refs.add(order.internalRef)
      }
    }
    return refs
  }, [orders])

  const filtered = useMemo(() => {
    return items.filter(
      (item) =>
        messageMatchesSearch(item, searchQuery) &&
        messageMatchesTypeFilter(item, typeFilter)
    )
  }, [items, searchQuery, typeFilter])

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function scrollToCompose(internalRef: string) {
    setComposeRef(internalRef)
    document.getElementById("messages-compose")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <div className="pb-4 space-y-0" data-sop="admin-messages-page">
      <AdminPortalSection first title="Overview">
        <MetricStrip
          metrics={[
            { label: "Total", value: stats.total },
            { label: "Sent", value: stats.sent },
            { label: "Failed", value: stats.failed },
          ]}
        />
        {stats.skipped > 0 ? (
          <p className="text-caption text-sm mt-3 font-body">
            {stats.skipped} logged only (Resend off).
          </p>
        ) : null}
      </AdminPortalSection>

      <AdminPortalSection title="Send">
        <div
          id="messages-compose"
          className="pb-6 sm:pb-8"
          data-sop="messages-compose"
        >
          <AdminMessagesComposer
            orders={orders}
            batchLabel={batchLabel}
            initialSelectedRef={composeRef}
          />
        </div>
      </AdminPortalSection>

      <AdminPortalSection title="Log">
        <div data-sop="messages-log">
        <AdminCollapsibleFilters
          className="mb-4"
          defaultOpen={
            searchQuery.trim().length > 0 || typeFilter !== "all"
          }
          hasActiveFilters={
            searchQuery.trim().length > 0 || typeFilter !== "all"
          }
          summary={
            searchQuery.trim()
              ? typeFilter !== "all"
                ? `Search · ${TYPE_FILTERS.find((f) => f.id === typeFilter)?.label ?? typeFilter}`
                : "Search"
              : typeFilter !== "all"
                ? TYPE_FILTERS.find((f) => f.id === typeFilter)?.label
                : undefined
          }
        >
          <label className="block">
            <span className="sr-only">Search messages</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-4 py-3 text-espresso font-body text-base shadow-gentle focus:border-sage"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold font-body transition-colors ${
                  typeFilter === f.id
                    ? "bg-espresso text-cream border-espresso"
                    : "bg-warm-white text-espresso border-espresso/20 hover:bg-linen"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </AdminCollapsibleFilters>

        {items.length === 0 ? (
          <EmptyState
            title="No messages yet"
            message="Sent emails appear here."
          />
        ) : filtered.length === 0 ? (
          <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
            No matches.
          </p>
        ) : (
          <DashboardCard>
            <ul className="divide-y divide-espresso/10">
              {filtered.map((item) => {
                const expanded = expandedIds.has(item.id)
                const method = item.order?.fulfillmentMethod?.trim()
                const canSend = sendableRefSet.has(item.log.internalRef.trim())
                return (
                  <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-espresso font-body">
                            {item.log.emailType}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(item.deliveryStatus)}`}
                          >
                            {statusLabel(item.deliveryStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal mt-1 font-body">
                          {item.log.customerName || item.log.customerEmail || "—"}
                          {method ? (
                            <span className="text-caption">
                              {" "}
                              · {method === "pickup" ? "Pickup" : "Delivery"}
                            </span>
                          ) : null}
                        </p>
                        <p className="text-sm font-medium text-espresso mt-1 truncate">
                          {item.log.subject}
                        </p>
                        <p className="text-caption text-xs mt-1">
                          {item.log.timestamp} · {item.log.internalRef}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {canSend ? (
                          <button
                            type="button"
                            onClick={() => scrollToCompose(item.log.internalRef)}
                            className={adminBtnSecondary}
                          >
                            Send again
                          </button>
                        ) : null}
                        <Link
                          href={`/admin/orders/${encodeURIComponent(item.log.internalRef)}`}
                          className={adminBtnSecondary}
                        >
                          Open order
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          className={adminBtnSecondary}
                        >
                          {expanded ? "Hide" : "Body"}
                        </button>
                      </div>
                    </div>
                    {expanded ? (
                      <pre className="mt-3 rounded-soft bg-linen/50 border border-oatmeal/40 p-3 text-xs whitespace-pre-wrap font-body text-charcoal/90 max-h-48 overflow-y-auto">
                        {item.log.message || "(empty)"}
                      </pre>
                    ) : null}
                    {item.deliveryStatus === "failed" ? (
                      <p className="text-sm text-red-800 mt-2 font-body">
                        {item.log.sentStatus}
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </DashboardCard>
        )}
        </div>
      </AdminPortalSection>
    </div>
  )
}

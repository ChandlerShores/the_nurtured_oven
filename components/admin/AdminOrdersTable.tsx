"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdminOrderSlicers, { toggleFilterSet } from "@/components/admin/AdminOrderSlicers"
import {
  buildFulfillmentSlicerOptions,
  buildStatusSlicerOptions,
  adminOrderKey,
  orderMatchesSearch,
  orderPassesFilters,
  pruneSlicerFilters,
  slicerFiltersChanged,
  type AdminOrderSlicerFilters,
} from "@/lib/admin/order-filters"
import {
  bulkStatusSkippedCount,
  previewBulkMarkInProgress,
  previewBulkMarkReady,
  type BulkStatusTarget,
} from "@/lib/admin/bulk-order-status"
import {
  normalizeOrderStatus,
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from "@/lib/admin/order-status"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { statusControlClass } from "@/components/admin/ui/StatusPill"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminOrdersTableProps {
  orders: AdminOrderRow[]
  batchLabel: string
  weekKey: string
  initialStatus?: string
  initialAttention?: string
}

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

function formatDeliveryLocation(order: AdminOrderRow): string {
  const address = order.deliveryAddress.trim()
  const city = order.deliveryCity.trim()
  const zip = order.deliveryZip.trim()
  if (!address && !city && !zip) return ""

  let line = address
  if (city) {
    line = line ? `${line}, ${city}` : city
  }
  if (zip) {
    line = line ? `${line} ${zip}` : zip
  }
  return line
}

const zebraEven = "bg-warm-white"
const zebraOdd = "bg-linen/45"

function initialFiltersFromParams(
  initialStatus?: string,
  initialAttention?: string
): AdminOrderSlicerFilters {
  const status = initialStatus?.trim()
  const attention = initialAttention?.trim().toLowerCase()
  const filters: AdminOrderSlicerFilters = {
    status: new Set(),
    fulfillment: new Set(),
  }

  if (status && (ORDER_STATUS_OPTIONS as readonly string[]).includes(status)) {
    filters.status.add(status)
  }
  if (attention === "issues" && !status) {
    filters.status.add("Issue")
  }

  return filters
}

export default function AdminOrdersTable({
  orders,
  batchLabel,
  weekKey,
  initialStatus,
  initialAttention,
}: AdminOrdersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlStatus = searchParams.get("status") ?? initialStatus
  const urlAttention = searchParams.get("attention") ?? initialAttention
  const urlSeed = initialFiltersFromParams(urlStatus ?? undefined, urlAttention ?? undefined)
  const [statusByRef, setStatusByRef] = useState<Record<string, OrderStatus>>(
    () =>
      Object.fromEntries(
        orders.map((o) => [
          adminOrderKey(o),
          normalizeOrderStatus(o.orderStatus) as OrderStatus,
        ])
      )
  )
  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [bulkApplying, setBulkApplying] = useState(false)
  const [bulkDialogTarget, setBulkDialogTarget] =
    useState<BulkStatusTarget | null>(null)
  const [error, setError] = useState<string | null>(null)
  const bulkInProgressPreview = useMemo(
    () => previewBulkMarkInProgress(orders),
    [orders]
  )
  const bulkReadyPreview = useMemo(() => previewBulkMarkReady(orders), [orders])
  const newOrderCount = bulkInProgressPreview.eligible.length
  const bulkDialogPreview =
    bulkDialogTarget === "In progress"
      ? bulkInProgressPreview
      : bulkDialogTarget === "Ready"
        ? bulkReadyPreview
        : null
  const [filters, setFilters] = useState<AdminOrderSlicerFilters>(urlSeed)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set())

  const statusOptions = useMemo(() => {
    const pool = orders.filter((order) =>
      orderPassesFilters(order, filters, statusByRef, "status")
    )
    return buildStatusSlicerOptions(pool, statusByRef)
  }, [orders, filters, statusByRef])

  const fulfillmentOptions = useMemo(() => {
    const pool = orders.filter((order) =>
      orderPassesFilters(order, filters, statusByRef, "fulfillment")
    )
    return buildFulfillmentSlicerOptions(pool)
  }, [orders, filters, statusByRef])

  const effectiveFilters = useMemo(
    () => pruneSlicerFilters(filters, statusOptions, fulfillmentOptions),
    [filters, statusOptions, fulfillmentOptions]
  )

  useEffect(() => {
    if (slicerFiltersChanged(filters, effectiveFilters)) {
      setFilters(effectiveFilters)
    }
  }, [filters, effectiveFilters])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!orderPassesFilters(order, effectiveFilters, statusByRef)) return false
      if (!orderMatchesSearch(order, searchQuery)) return false
      return true
    })
  }, [orders, effectiveFilters, statusByRef, searchQuery])

  function toggleExpanded(internalRef: string) {
    setExpandedRefs((prev) => {
      const next = new Set(prev)
      if (next.has(internalRef)) next.delete(internalRef)
      else next.add(internalRef)
      return next
    })
  }

  async function handleStatusChange(order: AdminOrderRow, status: OrderStatus) {
    const key = adminOrderKey(order)
    setStatusByRef((prev) => ({ ...prev, [key]: status }))
    setSavingRef(key)
    setError(null)

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetRow: order.sheetRow,
          internalRef: order.internalRef,
          status,
        }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Could not save status.")
      }

      router.refresh()
    } catch (err) {
      setStatusByRef((prev) => ({
        ...prev,
        [key]: order.orderStatus as OrderStatus,
      }))
      setError(err instanceof Error ? err.message : "Could not save status.")
    } finally {
      setSavingRef(null)
    }
  }

  const closeBulkDialog = useCallback(() => {
    if (!bulkApplying) setBulkDialogTarget(null)
  }, [bulkApplying])

  useEffect(() => {
    if (!bulkDialogTarget) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeBulkDialog()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [bulkDialogTarget, closeBulkDialog])

  async function executeBulkStatusUpdate() {
    if (!bulkDialogTarget) return
    setBulkApplying(true)
    setError(null)

    const label = bulkDialogTarget

    try {
      const res = await fetch("/api/admin/orders/status/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekKey, status: bulkDialogTarget }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        updated?: number
        failed?: { internalRef: string; error: string }[]
      }
      if (!res.ok) {
        throw new Error(data.error ?? `Could not mark orders as ${label}.`)
      }
      if (data.failed && data.failed.length > 0) {
        throw new Error(
          `Updated ${data.updated ?? 0}, but ${data.failed.length} failed. First: ${data.failed[0].internalRef}.`
        )
      }
      setBulkDialogTarget(null)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not mark orders as ${label}.`
      )
    } finally {
      setBulkApplying(false)
    }
  }

  if (orders.length === 0) {
    return (
      <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
        No orders for {batchLabel}.
      </p>
    )
  }

  return (
    <div className="pb-4">
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 font-body mb-6">
          {error}
        </p>
      ) : null}

      <AdminPortalSection first collapsible={false} title={batchLabel}>
        {newOrderCount > 0 ? (
          <div className="mb-4 rounded-lg border-2 border-blush/70 bg-blush/15 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-body text-espresso">
              <span className="font-semibold">
                {newOrderCount} {newOrderCount === 1 ? "order" : "orders"} still at New
              </span>
              {" — "}
              move to In progress when reviewed.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    status: new Set(["New"]),
                  }))
                }
              >
                Show New only
              </button>
              <button
                type="button"
                className={adminBtnPrimary}
                disabled={
                  bulkApplying || savingRef !== null
                }
                onClick={() => setBulkDialogTarget("In progress")}
              >
                All → In progress ({newOrderCount})
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap mb-4">
            <button
              type="button"
              className={newOrderCount > 0 ? adminBtnPrimary : adminBtnSecondary}
              disabled={
                bulkApplying ||
                bulkInProgressPreview.eligible.length === 0 ||
                savingRef !== null
              }
              onClick={() => setBulkDialogTarget("In progress")}
            >
              All → In progress
              {bulkInProgressPreview.eligible.length > 0
                ? ` (${bulkInProgressPreview.eligible.length})`
                : ""}
            </button>
            <button
              type="button"
              className={adminBtnSecondary}
              disabled={
                bulkApplying ||
                bulkReadyPreview.eligible.length === 0 ||
                savingRef !== null
              }
              onClick={() => setBulkDialogTarget("Ready")}
            >
              All → Ready
              {bulkReadyPreview.eligible.length > 0
                ? ` (${bulkReadyPreview.eligible.length})`
                : ""}
            </button>
        </div>
        <AdminOrderSlicers
          statusOptions={statusOptions}
          fulfillmentOptions={fulfillmentOptions}
          filters={effectiveFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleStatus={(value) =>
            setFilters((f) => ({
              ...f,
              status: toggleFilterSet(f.status, value),
            }))
          }
          onToggleFulfillment={(value) =>
            setFilters((f) => ({
              ...f,
              fulfillment: toggleFilterSet(f.fulfillment, value),
            }))
          }
          onClearStatus={() =>
            setFilters((f) => ({ ...f, status: new Set() }))
          }
          onClearFulfillment={() =>
            setFilters((f) => ({ ...f, fulfillment: new Set() }))
          }
          onClearAll={() => {
            setFilters({ status: new Set(), fulfillment: new Set() })
            setSearchQuery("")
          }}
        />
      {filteredOrders.length === 0 ? (
        <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
          No matches.
        </p>
      ) : (
        <DashboardCard>
          <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-sm font-body">
              <thead className="bg-sage-deep text-cream sticky top-0 z-[1]">
                <tr>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Items</th>
                  <th className="px-3 py-3 font-medium">Fulfillment</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium w-24" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order.internalRef}
                    className={`border-t border-espresso/15 align-top ${
                      index % 2 === 0 ? zebraEven : zebraOdd
                    }`}
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-espresso">
                        {order.customerName || "—"}
                      </p>
                      <p className="text-caption text-xs mt-0.5">
                        {order.customerEmail || "—"}
                      </p>
                      <p className="text-espresso/55 text-xs mt-0.5">
                        {order.customerPhone || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-caption max-w-xs">
                      <p className={expandedRefs.has(order.internalRef) ? "" : "line-clamp-2"}>
                        {order.itemsSummary || "—"}
                      </p>
                      {order.itemsSummary.length > 80 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(order.internalRef)}
                          className="mt-1 text-xs font-semibold text-espresso underline-offset-2 hover:underline"
                        >
                          {expandedRefs.has(order.internalRef) ? "Show less" : "Show all"}
                        </button>
                      ) : null}
                      <NoteTags order={order} />
                    </td>
                    <td className="px-3 py-3 text-espresso/80">
                      <p className="font-semibold">{formatMethod(order.fulfillmentMethod)}</p>
                      {order.fulfillmentMethod === "delivery" &&
                      formatDeliveryLocation(order) ? (
                        <p className="mt-1 text-caption">
                          {formatDeliveryLocation(order)}
                        </p>
                      ) : order.fulfillmentMethod === "delivery" ? (
                        <span className="mt-1 inline-flex rounded-full bg-terracotta/15 border border-terracotta/50 px-2 py-1 text-xs font-semibold text-espresso">
                          Missing address
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <StatusSelect
                        value={
                          statusByRef[adminOrderKey(order)] ??
                          (order.orderStatus as OrderStatus)
                        }
                        disabled={savingRef === adminOrderKey(order)}
                        onChange={(status) =>
                          handleStatusChange(order, status)
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/orders/${encodeURIComponent(order.internalRef)}`}
                        className={`${adminBtnSecondary} inline-block text-xs px-3 py-1.5`}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-3 mt-4">
            {filteredOrders.map((order, index) => (
              <li
                key={order.internalRef}
                className={`rounded-lg border border-espresso/15 p-4 shadow-gentle font-body ${
                  index % 2 === 0 ? zebraEven : zebraOdd
                }`}
              >
                <p className="font-semibold text-espresso text-lg">
                  {order.customerName || "Customer"}
                </p>
                <p className="text-caption text-sm mt-0.5">{order.customerEmail || "—"}</p>
                <p className="text-espresso/55 text-sm mt-0.5">
                  {order.customerPhone || "—"}
                </p>
                <p className={`mt-3 text-espresso ${expandedRefs.has(order.internalRef) ? "" : "line-clamp-3"}`}>
                  {order.itemsSummary || "—"}
                </p>
                {order.itemsSummary.length > 80 ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(order.internalRef)}
                    className="mt-1 text-sm font-semibold text-espresso underline-offset-2 hover:underline"
                  >
                    {expandedRefs.has(order.internalRef) ? "Show less" : "Show all"}
                  </button>
                ) : null}
                <NoteTags order={order} />
                <p className="mt-2 text-caption">
                  {formatMethod(order.fulfillmentMethod)}
                  {order.fulfillmentMethod === "delivery" &&
                  formatDeliveryLocation(order)
                    ? ` · ${formatDeliveryLocation(order)}`
                    : ""}
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-espresso mb-2">
                    Status
                  </label>
                  <StatusSelect
                    value={
                      statusByRef[adminOrderKey(order)] ??
                      (order.orderStatus as OrderStatus)
                    }
                    disabled={savingRef === adminOrderKey(order)}
                    onChange={(status) =>
                      handleStatusChange(order, status)
                    }
                  />
                </div>
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.internalRef)}`}
                  className={`${adminBtnPrimary} w-full mt-4 text-sm`}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}
      </AdminPortalSection>

      {bulkDialogTarget && bulkDialogPreview ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-status-title"
          onClick={closeBulkDialog}
        >
          <div
            className="w-full max-w-md rounded-t-softer sm:rounded-softer bg-warm-white border border-oatmeal/60 shadow-warm p-5 sm:p-6 max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="bulk-status-title"
              className="font-heading text-2xl text-charcoal tracking-wide"
            >
              {bulkDialogTarget === "In progress"
                ? "Mark week In progress?"
                : "Mark week Ready?"}
            </h2>
            <p className="text-caption text-sm mt-2 font-body">
              {bulkDialogPreview.eligible.length} order
              {bulkDialogPreview.eligible.length === 1 ? "" : "s"} →{" "}
              <span className="font-semibold text-espresso">
                {bulkDialogTarget}
              </span>
            </p>

            <ul className="mt-4 max-h-44 overflow-y-auto rounded-soft border border-oatmeal/50 divide-y divide-oatmeal/40 bg-linen/30">
              {bulkDialogPreview.eligible.map((order) => (
                <li
                  key={adminOrderKey(order)}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-body"
                >
                  <span className="font-medium text-charcoal truncate">
                    {order.customerName || order.customerEmail || order.internalRef}
                  </span>
                  <span className="shrink-0 text-caption text-xs tabular-nums">
                    {order.orderStatus || "New"}
                  </span>
                </li>
              ))}
            </ul>

            {bulkStatusSkippedCount(bulkDialogPreview) > 0 ? (
              <p className="mt-4 text-sm text-muted font-body rounded-soft bg-sage/10 border border-sage/30 px-3 py-2.5">
                <span className="font-semibold text-espresso">
                  {bulkStatusSkippedCount(bulkDialogPreview)} skipped
                </span>
                {" — "}
                {bulkDialogTarget === "In progress"
                  ? "already In progress, Ready, or final."
                  : "already Ready or final."}
              </p>
            ) : null}

            <p className="text-caption text-xs mt-4 font-body">
              Saves to Sheets. Change individual orders anytime.
            </p>

            <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                disabled={bulkApplying}
                onClick={() => void executeBulkStatusUpdate()}
                className={`${adminBtnPrimary} w-full sm:w-auto`}
              >
                {bulkApplying ? "Updating…" : "Confirm"}
              </button>
              <button
                type="button"
                disabled={bulkApplying}
                onClick={closeBulkDialog}
                className={`${adminBtnSecondary} w-full sm:w-auto`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: string
  disabled: boolean
  onChange: (status: OrderStatus) => void
}) {
  const known = (ORDER_STATUS_OPTIONS as readonly string[]).includes(value)

  return (
    <select
      value={known ? value : ORDER_STATUS_OPTIONS[0]}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className={`w-full sm:max-w-[12rem] rounded-md border px-3 py-2.5 min-h-[44px] font-body text-base font-semibold disabled:opacity-60 ${statusControlClass(value)}`}
      aria-label="Order status"
    >
      {!known && value ? (
        <option value={value} disabled>
          {value} (save)
        </option>
      ) : null}
      {ORDER_STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}

function NoteTags({ order }: { order: AdminOrderRow }) {
  const tags = [
    order.dietary.trim()
      ? { label: "Dietary", value: order.dietary.trim(), tone: "amber" }
      : null,
    order.message.trim()
      ? { label: "Note", value: order.message.trim(), tone: "rose" }
      : null,
  ].filter(Boolean) as { label: string; value: string; tone: string }[]

  if (tags.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.label}
          className={`inline-flex max-w-full rounded-full border px-2 py-1 text-xs font-semibold ${
            tag.tone === "amber"
              ? "border-warm-honey/70 bg-warm-honey/15 text-espresso"
              : "border-blush/70 bg-blush/15 text-espresso"
          }`}
          title={tag.value}
        >
          {tag.label}: <span className="ml-1 truncate max-w-[12rem]">{tag.value}</span>
        </span>
      ))}
    </div>
  )
}

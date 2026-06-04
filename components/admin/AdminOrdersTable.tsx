"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AdminOrderSlicers, { toggleFilterSet } from "@/components/admin/AdminOrderSlicers"
import {
  buildFulfillmentSlicerOptions,
  buildStatusSlicerOptions,
  adminOrderKey,
  orderPassesFilters,
  pruneSlicerFilters,
  slicerFiltersChanged,
  type AdminOrderSlicerFilters,
} from "@/lib/admin/order-filters"
import {
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from "@/lib/admin/order-status"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { statusControlClass } from "@/components/admin/ui/StatusPill"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminOrdersTableProps {
  orders: AdminOrderRow[]
  batchLabel: string
}

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

const zebraEven = "bg-warm-white"
const zebraOdd = "bg-linen/45"

function isDelivery(order: AdminOrderRow): boolean {
  return order.fulfillmentMethod.trim().toLowerCase() === "delivery"
}

function needsAttention(order: AdminOrderRow, status: string): boolean {
  const payment = order.paymentStatus.trim().toLowerCase()
  return (
    status === "New" ||
    status === "Issue" ||
    !payment ||
    (payment !== "paid" && payment !== "completed") ||
    (isDelivery(order) &&
      (!order.deliveryAddress.trim() || !order.deliveryZip.trim()))
  )
}

export default function AdminOrdersTable({
  orders,
  batchLabel,
}: AdminOrdersTableProps) {
  const router = useRouter()
  const [statusByRef, setStatusByRef] = useState<Record<string, OrderStatus>>(
    () =>
      Object.fromEntries(
        orders.map((o) => [adminOrderKey(o), o.orderStatus as OrderStatus])
      )
  )
  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdminOrderSlicerFilters>({
    status: new Set(),
    fulfillment: new Set(),
  })
  const [urgencyOnly, setUrgencyOnly] = useState(false)
  const [deliveryOnly, setDeliveryOnly] = useState(false)
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
      const status =
        statusByRef[adminOrderKey(order)] ?? (order.orderStatus as OrderStatus)
      if (!orderPassesFilters(order, effectiveFilters, statusByRef)) return false
      if (urgencyOnly && !needsAttention(order, status)) return false
      if (deliveryOnly && !isDelivery(order)) return false
      return true
    })
  }, [orders, effectiveFilters, statusByRef, urgencyOnly, deliveryOnly])

  const attentionCount = useMemo(
    () =>
      orders.filter((order) =>
        needsAttention(
          order,
          statusByRef[adminOrderKey(order)] ?? (order.orderStatus.trim() || "New")
        )
      ).length,
    [orders, statusByRef]
  )

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

  if (orders.length === 0) {
    return (
      <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
        No orders yet for {batchLabel}. New paid orders will show up here
        automatically.
      </p>
    )
  }

  return (
    <DashboardCard title="Order list" subtitle="Filter by urgency, fulfillment, or status" className="space-y-4">
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2 font-body">
          {error}
        </p>
      ) : null}

      <AdminOrderSlicers
        statusOptions={statusOptions}
        fulfillmentOptions={fulfillmentOptions}
        filters={effectiveFilters}
        filteredCount={filteredOrders.length}
        totalCount={orders.length}
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
        onClearAll={() =>
          setFilters({
            status: new Set(),
            fulfillment: new Set(),
          })
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUrgencyOnly((v) => !v)}
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${
            urgencyOnly
              ? "bg-terracotta text-cream border-terracotta"
              : "bg-warm-white text-espresso border-espresso/20 hover:bg-linen"
          }`}
          aria-pressed={urgencyOnly}
        >
          Needs attention ({attentionCount})
        </button>
        <button
          type="button"
          onClick={() => setDeliveryOnly((v) => !v)}
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${
            deliveryOnly
              ? "bg-sage-deep text-cream border-sage-deep"
              : "bg-warm-white text-espresso border-espresso/20 hover:bg-linen"
          }`}
          aria-pressed={deliveryOnly}
        >
          Delivery only
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
          No orders match the current filters. Try clearing a slicer or choose
          &quot;All&quot; for that group.
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-lg border border-espresso/15 bg-warm-white shadow-gentle">
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
                        {order.customerPhone || "No phone"}
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
                      order.deliveryAddress ? (
                        <p className="mt-1 text-caption">
                          {order.deliveryAddress}
                          {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                          {order.deliveryZip ? ` ${order.deliveryZip}` : ""}
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

          <ul className="md:hidden space-y-3">
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
                  {order.customerPhone || "No phone"}
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
                    {expandedRefs.has(order.internalRef) ? "Show less" : "Show full items"}
                  </button>
                ) : null}
                <NoteTags order={order} />
                <p className="mt-2 text-caption">
                  {formatMethod(order.fulfillmentMethod)}
                  {order.fulfillmentMethod === "delivery" && order.deliveryAddress
                    ? ` · ${order.deliveryAddress}`
                    : ""}
                </p>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-espresso mb-2">
                    Order status
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
                  Open order
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
    </DashboardCard>
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
          {value} (update to save)
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

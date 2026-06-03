"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AdminOrderSlicers, { toggleFilterSet } from "@/components/admin/AdminOrderSlicers"
import {
  buildFulfillmentSlicerOptions,
  buildStatusSlicerOptions,
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
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
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

export default function AdminOrdersTable({
  orders,
  batchLabel,
}: AdminOrdersTableProps) {
  const router = useRouter()
  const [statusByRef, setStatusByRef] = useState<Record<string, OrderStatus>>(
    () =>
      Object.fromEntries(
        orders.map((o) => [o.internalRef, o.orderStatus as OrderStatus])
      )
  )
  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdminOrderSlicerFilters>({
    status: new Set(),
    fulfillment: new Set(),
  })

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
    return orders.filter((order) =>
      orderPassesFilters(order, effectiveFilters, statusByRef)
    )
  }, [orders, effectiveFilters, statusByRef])

  async function handleStatusChange(internalRef: string, status: OrderStatus) {
    setStatusByRef((prev) => ({ ...prev, [internalRef]: status }))
    setSavingRef(internalRef)
    setError(null)

    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalRef, status }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Could not save status.")
      }

      router.refresh()
    } catch (err) {
      const order = orders.find((o) => o.internalRef === internalRef)
      if (order) {
        setStatusByRef((prev) => ({
          ...prev,
          [internalRef]: order.orderStatus as OrderStatus,
        }))
      }
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
    <DashboardCard title="Order list" className="space-y-4">
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

      {filteredOrders.length === 0 ? (
        <p className="text-caption font-body rounded-soft bg-linen/80 border border-oatmeal/60 px-4 py-6 text-center">
          No orders match the current filters. Try clearing a slicer or choose
          &quot;All&quot; for that group.
        </p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-soft border border-oatmeal/60 bg-warm-white shadow-gentle">
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
                    className={`border-t border-oatmeal/35 align-top ${
                      index % 2 === 0 ? zebraEven : zebraOdd
                    }`}
                  >
                    <td className="px-3 py-3">
                      <p className="font-medium text-espresso">
                        {order.customerName || "—"}
                      </p>
                      <p className="text-caption text-sm mt-0.5">
                        {order.customerPhone || order.customerEmail || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-caption max-w-xs">
                      {order.itemsSummary || "—"}
                      {order.dietary ? (
                        <p className="mt-1 text-espresso/80">
                          Dietary: {order.dietary}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-caption">
                      <p>{formatMethod(order.fulfillmentMethod)}</p>
                      {order.fulfillmentMethod === "delivery" &&
                      order.deliveryAddress ? (
                        <p className="mt-1">
                          {order.deliveryAddress}
                          {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <StatusSelect
                        value={
                          statusByRef[order.internalRef] ??
                          (order.orderStatus as OrderStatus)
                        }
                        disabled={savingRef === order.internalRef}
                        onChange={(status) =>
                          handleStatusChange(order.internalRef, status)
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
                className={`rounded-soft border border-oatmeal/60 p-4 shadow-gentle font-body ${
                  index % 2 === 0 ? zebraEven : zebraOdd
                }`}
              >
                <p className="font-medium text-espresso text-lg">
                  {order.customerName || "Customer"}
                </p>
                <p className="text-caption text-sm mt-0.5">
                  {order.customerPhone || order.customerEmail || "—"}
                </p>
                <p className="mt-3 text-espresso">{order.itemsSummary || "—"}</p>
                {order.dietary ? (
                  <p className="mt-1 text-caption text-sm">
                    Dietary: {order.dietary}
                  </p>
                ) : null}
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
                      statusByRef[order.internalRef] ??
                      (order.orderStatus as OrderStatus)
                    }
                    disabled={savingRef === order.internalRef}
                    onChange={(status) =>
                      handleStatusChange(order.internalRef, status)
                    }
                  />
                </div>
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.internalRef)}`}
                  className={`${adminBtnSecondary} inline-block mt-4 text-sm`}
                >
                  Send customer update →
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
      className="w-full max-w-[12rem] rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2 text-charcoal font-body text-base disabled:opacity-60"
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

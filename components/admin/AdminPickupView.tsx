"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import MetricCard from "@/components/admin/ui/MetricCard"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { statusControlClass } from "@/components/admin/ui/StatusPill"
import { adminOrderKey } from "@/lib/admin/order-filters"
import {
  ORDER_STATUS_OPTIONS,
  type OrderStatus,
} from "@/lib/admin/order-status"
import {
  isActivePickupStop,
  isPaidPickupOrder,
  isPickupOrder,
  isReadyForPickupStatus,
} from "@/lib/pickup/pickup-orders"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminPickupViewProps {
  orders: AdminOrderRow[]
  batchLabel: string
}

function formatItemsSummary(summary: string): string {
  const trimmed = summary.trim()
  if (!trimmed) return "—"
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed
}

export default function AdminPickupView({
  orders,
  batchLabel,
}: AdminPickupViewProps) {
  const router = useRouter()
  const pickupOrders = useMemo(
    () => orders.filter(isPickupOrder),
    [orders]
  )
  const paidPickups = useMemo(
    () => pickupOrders.filter(isPaidPickupOrder),
    [pickupOrders]
  )
  const active = useMemo(
    () => paidPickups.filter((o) => isActivePickupStop(o.orderStatus)),
    [paidPickups]
  )
  const ready = useMemo(
    () => active.filter((o) => isReadyForPickupStatus(o.orderStatus)),
    [active]
  )
  const completed = useMemo(
    () => paidPickups.filter((o) => !isActivePickupStop(o.orderStatus)),
    [paidPickups]
  )

  const [statusByRef, setStatusByRef] = useState<Record<string, OrderStatus>>(
    () =>
      Object.fromEntries(
        paidPickups.map((o) => [adminOrderKey(o), o.orderStatus as OrderStatus])
      )
  )
  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function updateStatus(order: AdminOrderRow, status: OrderStatus) {
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
        throw new Error(data.error ?? "Could not update status.")
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

  async function markPickedUp(order: AdminOrderRow) {
    await updateStatus(order, "Delivered / Picked Up")
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard label="Pickup orders" value={pickupOrders.length} />
        <MetricCard label="Paid" value={paidPickups.length} />
        <MetricCard label="Ready / packed" value={ready.length} />
        <MetricCard label="Still waiting" value={active.length} />
      </div>

      <DashboardCard
        title="Friday pickup queue"
        subtitle={`${batchLabel} · Mark picked up when the customer leaves`}
      >
        {paidPickups.length === 0 ? (
          <EmptyState
            title="No pickup orders"
            message="Pickup customers will appear here when they choose free Friday pickup at checkout."
          />
        ) : (
          <ul className="space-y-3">
            {active.map((order) => {
              const key = adminOrderKey(order)
              const status = statusByRef[key] ?? (order.orderStatus as OrderStatus)
              const busy = savingRef === key
              return (
                <li
                  key={key}
                  className="rounded-lg border border-espresso/15 bg-warm-white px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-espresso">
                        {order.customerName || order.customerEmail || "Customer"}
                      </p>
                      <p className="text-caption mt-1">
                        {formatItemsSummary(order.itemsSummary)}
                      </p>
                      {order.dietary.trim() ? (
                        <p className="text-xs text-blush font-medium mt-2">
                          Dietary: {order.dietary.trim()}
                        </p>
                      ) : null}
                      {order.customerPhone.trim() ? (
                        <p className="text-caption text-xs mt-1">
                          {order.customerPhone.trim()}
                        </p>
                      ) : null}
                    </div>
                    <StatusPill status={status} />
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <select
                      value={status}
                      disabled={busy}
                      onChange={(e) =>
                        void updateStatus(order, e.target.value as OrderStatus)
                      }
                      className={`w-full sm:max-w-[12rem] rounded-md border px-3 py-2.5 min-h-[44px] font-body text-base font-semibold disabled:opacity-60 ${statusControlClass(status)}`}
                      aria-label={`Status for ${order.customerName || order.internalRef}`}
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void markPickedUp(order)}
                      className={`${adminBtnSecondary} w-full sm:w-auto`}
                    >
                      {busy ? "Saving…" : "Mark picked up"}
                    </button>
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.internalRef)}`}
                      className="text-sm font-semibold text-sage-deep hover:underline"
                    >
                      Email & details →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DashboardCard>

      {completed.length > 0 ? (
        <DashboardCard
          title="Completed pickups"
          subtitle="Finished for this bake week"
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completed.map((order) => (
              <li
                key={adminOrderKey(order)}
                className="rounded-lg border border-espresso/10 bg-linen/35 px-4 py-3 text-sm opacity-85"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-espresso">
                    {order.customerName || order.customerEmail || "Customer"}
                  </p>
                  <StatusPill status={order.orderStatus || "Complete"} />
                </div>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}
    </div>
  )
}

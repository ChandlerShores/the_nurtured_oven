"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import MetricCard from "@/components/admin/ui/MetricCard"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import type { OrderStatus } from "@/lib/admin/order-status"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminDeliveriesViewProps {
  orders: AdminOrderRow[]
  batchLabel: string
}

function mapsQuery(order: AdminOrderRow): string {
  const parts = [order.deliveryAddress, order.deliveryCity].filter(Boolean)
  return encodeURIComponent(parts.join(", "))
}

function hasAddress(order: AdminOrderRow): boolean {
  return Boolean(order.deliveryAddress?.trim())
}

export default function AdminDeliveriesView({
  orders,
  batchLabel,
}: AdminDeliveriesViewProps) {
  const router = useRouter()
  const deliveryOrders = useMemo(
    () =>
      orders.filter(
        (o) => o.fulfillmentMethod.trim().toLowerCase() === "delivery"
      ),
    [orders]
  )
  const mapped = deliveryOrders.filter(hasAddress)
  const unmapped = deliveryOrders.filter((o) => !hasAddress(o))
  const pending = deliveryOrders.filter((o) => {
    const s = o.orderStatus.trim()
    return s !== "Delivered" && s !== "Complete"
  })

  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function markDelivered(internalRef: string) {
    setSavingRef(internalRef)
    setError(null)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalRef,
          status: "Delivered" as OrderStatus,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Could not update status.")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark delivered.")
    } finally {
      setSavingRef(null)
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard label="Deliveries" value={deliveryOrders.length} />
        <MetricCard label="With address" value={mapped.length} />
        <MetricCard label="Needs address" value={unmapped.length} />
        <MetricCard label="Still out" value={pending.length} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <DashboardCard
          title="Delivery route"
          subtitle={batchLabel || "This week"}
        >
          {deliveryOrders.length === 0 ? (
            <EmptyState
              title="No deliveries this week"
              message="Delivery orders will appear here when customers choose home delivery."
            />
          ) : (
            <ul className="space-y-3">
              {deliveryOrders.map((order) => (
                <li
                  key={order.internalRef}
                  className="rounded-soft border border-oatmeal/50 bg-linen/30 px-4 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-charcoal">
                        {order.customerName || "Customer"}
                      </p>
                      <p className="text-caption mt-1">
                        {order.itemsSummary || "—"}
                      </p>
                      {hasAddress(order) ? (
                        <p className="mt-2 text-charcoal/90">
                          {order.deliveryAddress}
                          {order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                        </p>
                      ) : (
                        <p className="mt-2 text-terracotta">Address missing</p>
                      )}
                    </div>
                    <StatusPill status={order.orderStatus || "New"} />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hasAddress(order) ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery(order)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={adminBtnSecondary}
                      >
                        Open in Maps
                      </a>
                    ) : null}
                    {order.orderStatus !== "Delivered" &&
                    order.orderStatus !== "Complete" ? (
                      <button
                        type="button"
                        disabled={savingRef === order.internalRef}
                        onClick={() => markDelivered(order.internalRef)}
                        className={adminBtnPrimary}
                      >
                        {savingRef === order.internalRef
                          ? "Saving…"
                          : "Mark delivered"}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Map" subtitle="Route overview">
          <div className="rounded-soft bg-linen/50 border border-oatmeal/40 aspect-[4/3] flex items-center justify-center text-center px-6">
            <p className="text-caption text-sm max-w-xs">
              Map view coming soon. Use Open in Maps on each stop for now.
            </p>
          </div>
        </DashboardCard>
      </div>

      {unmapped.length > 0 ? (
        <DashboardCard title="Missing addresses" subtitle="Contact customer before Friday">
          <ul className="space-y-2 text-sm">
            {unmapped.map((order) => (
              <li
                key={order.internalRef}
                className="flex justify-between gap-3 rounded-soft bg-blush/10 border border-blush/30 px-3 py-2"
              >
                <span>{order.customerName || order.customerEmail || "—"}</span>
                <span className="text-caption">{order.customerPhone || "—"}</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}
    </div>
  )
}

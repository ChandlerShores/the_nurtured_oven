"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AdminBulkCustomerEmail from "@/components/admin/AdminBulkCustomerEmail"
import DeliveryRouteBuilder from "@/components/admin/DeliveryRouteBuilder"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import EmptyState from "@/components/admin/ui/EmptyState"
import MetricStrip from "@/components/admin/ui/MetricStrip"
import StatusPill from "@/components/admin/ui/StatusPill"
import { adminOrderKey } from "@/lib/admin/order-filters"
import type { OrderStatus } from "@/lib/admin/order-status"
import {
  isActiveDeliveryStop,
  isPaidDeliveryOrder,
} from "@/lib/delivery/delivery-orders"
import {
  buildDeliveryItemTotals,
  totalBakeQuantity,
} from "@/lib/admin/production-aggregate"
import type { AdminOrderLineRow, AdminOrderRow } from "@/lib/google-sheets/orders"

interface AdminDeliveriesViewProps {
  orders: AdminOrderRow[]
  lineItems: AdminOrderLineRow[]
  batchLabel: string
  fulfillmentDate: string
  weekKey: string
}

function hasAddress(order: AdminOrderRow): boolean {
  return Boolean(order.deliveryAddress?.trim() && order.deliveryZip?.trim())
}

export default function AdminDeliveriesView({
  orders,
  lineItems,
  batchLabel,
  fulfillmentDate,
  weekKey,
}: AdminDeliveriesViewProps) {
  const router = useRouter()
  const deliveryOrders = useMemo(
    () => orders.filter((o) => o.fulfillmentMethod.trim().toLowerCase() === "delivery"),
    [orders]
  )
  const paidDeliveries = useMemo(
    () => deliveryOrders.filter(isPaidDeliveryOrder),
    [deliveryOrders]
  )
  const unmapped = paidDeliveries.filter((o) => !hasAddress(o))
  const pending = paidDeliveries.filter((o) => isActiveDeliveryStop(o.orderStatus))
  const completed = paidDeliveries.filter((o) => !pending.includes(o))
  const groupedByCity = useMemo(() => {
    const groups = new Map<string, AdminOrderRow[]>()
    for (const order of paidDeliveries) {
      const city = order.deliveryCity.trim() || "Missing city"
      groups.set(city, [...(groups.get(city) ?? []), order])
    }
    return Array.from(groups.entries())
  }, [paidDeliveries])

  const deliveryItemTotals = useMemo(
    () => buildDeliveryItemTotals(orders, lineItems),
    [orders, lineItems]
  )
  const totalDeliveryItems = useMemo(
    () => totalBakeQuantity(deliveryItemTotals),
    [deliveryItemTotals]
  )

  const [savingRef, setSavingRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function markDelivered(order: AdminOrderRow) {
    const key = adminOrderKey(order)
    setSavingRef(key)
    setError(null)
    try {
      const res = await fetch("/api/admin/orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetRow: order.sheetRow,
          internalRef: order.internalRef,
          status: "Delivered / Picked Up" as OrderStatus,
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
    <div className="pb-4" data-sop="admin-deliveries-page">
      {error ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {error}
        </p>
      ) : null}

      <AdminPortalSection first title="Delivery overview">
        <div data-sop="delivery-overview">
        <MetricStrip
          metrics={[
            { label: "Deliveries", value: deliveryOrders.length },
            { label: "Delivered", value: completed.length },
          ]}
        />
        </div>
      </AdminPortalSection>

      <AdminPortalSection title="Notify customers">
        <div data-sop="delivery-notify">
        <AdminBulkCustomerEmail
          emailType="out_for_delivery"
          weekKey={weekKey}
          emptyHint="Use when you leave for the route. Eligible: paid delivery orders in Ready or In progress."
        />
        </div>
      </AdminPortalSection>

      <AdminPortalSection title="Friday route">
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-5" data-sop="delivery-route-area">
          <DeliveryRouteBuilder
          orders={orders}
          batchLabel={batchLabel}
          fulfillmentDate={fulfillmentDate}
          onMarkDelivered={markDelivered}
          savingRef={savingRef}
        />

        <DashboardCard title="Route summary">
          <div className="space-y-4">
            {deliveryOrders.length === 0 ? (
              <EmptyState
                title="No deliveries this week"
                message="Delivery orders will appear here when customers choose home delivery."
              />
            ) : null}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Areas
              </p>
              {groupedByCity.map(([city, rows]) => (
                <div
                  key={city}
                  className="flex justify-between rounded-md border border-espresso/10 bg-warm-white px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-espresso">{city}</span>
                  <span className="tabular-nums text-espresso/70">{rows.length}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                  Items on route
                </p>
                <p className="text-xs text-espresso/60 tabular-nums">
                  {totalDeliveryItems} item{totalDeliveryItems === 1 ? "" : "s"} total
                </p>
              </div>
              {deliveryItemTotals.length === 0 ? (
                <p className="text-sm text-espresso/60 rounded-md border border-espresso/10 bg-warm-white px-3 py-2">
                  No active delivery stops with items yet.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {deliveryItemTotals.map((item) => (
                    <li
                      key={item.name}
                      className="flex justify-between gap-3 rounded-md border border-espresso/10 bg-warm-white px-3 py-2 text-sm"
                    >
                      <span className="text-espresso">{item.name}</span>
                      <span className="font-heading text-lg tabular-nums text-espresso shrink-0">
                        {item.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          </DashboardCard>
        </div>
      </AdminPortalSection>

      {unmapped.length > 0 ? (
        <AdminPortalSection title="Missing addresses">
          <DashboardCard>
            <ul className="space-y-2 text-sm">
              {unmapped.map((order) => (
                <li
                  key={adminOrderKey(order)}
                  className="flex justify-between gap-3 rounded-soft bg-blush/10 border border-blush/30 px-3 py-2"
                >
                  <span>{order.customerName || order.customerEmail || "—"}</span>
                  <span className="text-caption">{order.customerPhone || "—"}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </AdminPortalSection>
      ) : null}

      {completed.length > 0 ? (
        <AdminPortalSection title="Completed">
          <DashboardCard>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completed.map((order) => (
              <li
                key={adminOrderKey(order)}
                className="rounded-lg border border-espresso/10 bg-linen/35 px-4 py-3 text-sm opacity-80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-espresso">
                      {order.customerName || "Customer"}
                    </p>
                    <p className="text-caption mt-1">
                      {[order.deliveryAddress, order.deliveryCity, order.deliveryZip]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                  <StatusPill
                    status={order.orderStatus || "Delivered / Picked Up"}
                  />
                </div>
              </li>
            ))}
          </ul>
          </DashboardCard>
        </AdminPortalSection>
      ) : null}
    </div>
  )
}

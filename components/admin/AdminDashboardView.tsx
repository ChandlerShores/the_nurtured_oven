import Link from "next/link"
import DashboardNeedsAttention from "@/components/admin/DashboardNeedsAttention"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import MetricCard from "@/components/admin/ui/MetricCard"
import StatusPill, { StatusDot } from "@/components/admin/ui/StatusPill"
import { ORDER_STATUS_OPTIONS } from "@/lib/admin/order-status"
import {
  formatPaymentLabel,
  type DashboardStats,
} from "@/lib/admin/dashboard-stats"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/components/admin/ui/admin-button"

interface AdminDashboardViewProps {
  stats: DashboardStats
  loadError: string | null
  greeting: string
}

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

function maxStatusCount(counts: Record<string, number>): number {
  return Math.max(1, ...Object.values(counts))
}

export default function AdminDashboardView({
  stats,
  loadError,
  greeting,
}: AdminDashboardViewProps) {
  const totalFulfillment = stats.pickupCount + stats.deliveryCount
  const pickupPct =
    totalFulfillment > 0
      ? Math.round((stats.pickupCount / totalFulfillment) * 100)
      : 0
  const deliveryPct = totalFulfillment > 0 ? 100 - pickupPct : 0

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-espresso/15 pb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-caption text-sm">{greeting}</p>
          <h1 className="font-heading text-2xl sm:text-3xl text-espresso mt-1">
            Dashboard
          </h1>
          <p className="text-caption mt-2 break-words">
            Operational priorities for {stats.batchLabel || "this bake week"}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
          <Link href="/admin/orders" className={`${adminBtnPrimary} w-full sm:w-auto`}>
            View all orders
          </Link>
          <Link href="/admin/financials" className={`${adminBtnSecondary} w-full sm:w-auto`}>
            Financials
          </Link>
        </div>
      </header>

      <nav
        className="admin-portal-quick-nav flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 text-sm snap-x snap-mandatory"
        aria-label="Quick portal links"
      >
        {[
          { href: "/admin/production", label: "Production list" },
          { href: "/admin/pickup", label: "Pickup queue" },
          { href: "/admin/deliveries", label: "Deliveries" },
          { href: "/admin/settings", label: "Ordering controls" },
          { href: "/admin/menu", label: "Menu editor" },
          { href: "/admin/financials", label: "Bake week P&L" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 snap-start rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 min-h-[44px] inline-flex items-center text-espresso font-semibold hover:bg-linen transition-colors touch-manipulation"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
          {loadError}
        </p>
      ) : null}

      <DashboardNeedsAttention stats={stats} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard label="Total Orders" value={stats.totalOrders} />
        <MetricCard label="Revenue" value={stats.revenueDisplay} />
        <MetricCard label="Items to Bake" value={stats.itemsToBake} />
        <MetricCard label="Pickup" value={stats.pickupCount} />
        <MetricCard label="Delivery" value={stats.deliveryCount} />
        <MetricCard label="Open Orders" value={stats.openCount} />
      </div>

      <DashboardCard
        title="Recent orders"
        subtitle="Latest paid website activity for this week's batch"
      >
        {stats.recentOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="New paid orders will show up here automatically."
          />
        ) : (
          <RecentOrdersTable orders={stats.recentOrders} />
        )}
      </DashboardCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        <DashboardCard
          title="Upcoming Fulfillment"
          subtitle={stats.prepDayLabel}
        >
          <p className="text-sm text-espresso/80 mb-4">
            Next bake day:{" "}
            <span className="font-medium text-charcoal">{stats.batchLabel}</span>
          </p>
          {stats.productionList.length === 0 ? (
            <EmptyState
              title="No production list yet"
              message="Orders will populate your bake quantities here."
            />
          ) : (
            <ul className="space-y-2">
              {stats.productionList.map((item) => (
                <li
                  key={item.name}
                className="flex justify-between gap-3 rounded-md bg-linen/55 border border-espresso/10 px-3 py-2 text-sm"
                >
                  <span className="text-charcoal">{item.name}</span>
                  <span className="font-medium tabular-nums shrink-0">
                    {item.qty}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Orders by Status">
          <ul className="space-y-3">
            {ORDER_STATUS_OPTIONS.map((status) => {
              const count = stats.statusCounts[status] ?? 0
              const width = Math.round(
                (count / maxStatusCount(stats.statusCounts)) * 100
              )
              return (
                <li key={status} className="flex items-center gap-3 text-sm">
                  <StatusDot status={status} />
                  <span className="w-20 shrink-0 text-charcoal">{status}</span>
                  <div className="flex-1 h-2 rounded-full bg-linen overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sage-deep/70 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-espresso/75 w-6 text-right">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </DashboardCard>

        <DashboardCard title="Top Selling Items">
          {stats.topItems.length === 0 ? (
            <EmptyState
              title="No items yet"
              message="Item counts appear when orders include product lines."
            />
          ) : (
            <ul className="space-y-3">
              {stats.topItems.map((item) => {
                const max = stats.topItems[0]?.qty ?? 1
                const width = Math.round((item.qty / max) * 100)
                return (
                  <li key={item.name}>
                    <div className="flex justify-between text-sm mb-1 gap-2">
                      <span className="text-charcoal truncate">{item.name}</span>
                      <span className="font-medium tabular-nums shrink-0">
                        {item.qty}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-linen overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blush/70"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Pickup vs Delivery">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-soft bg-sage/25 border border-sage/40 p-4 text-center">
              <p className="text-2xl font-heading text-charcoal">
                {stats.pickupCount}
              </p>
              <p className="text-caption text-sm mt-1">Pickup</p>
              <p className="text-xs text-olive mt-2">{pickupPct}%</p>
            </div>
            <div className="rounded-soft bg-blush/20 border border-blush/35 p-4 text-center">
              <p className="text-2xl font-heading text-charcoal">
                {stats.deliveryCount}
              </p>
              <p className="text-caption text-sm mt-1">Delivery</p>
              <p className="text-xs text-olive mt-2">{deliveryPct}%</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Baker notes">
        <ul className="space-y-3 text-sm text-charcoal/90">
          <li className="flex gap-2">
            <span className="text-blush font-medium shrink-0">Packaging:</span>
            <span>Label boxes with customer name and pickup vs delivery.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blush font-medium shrink-0">Delivery:</span>
            <span>Confirm addresses before loading the car Friday morning.</span>
          </li>
          {stats.customerDietaryNotes.length > 0 ? (
            <li className="space-y-2">
              <p className="text-blush font-medium">Customer dietary notes:</p>
              <ul className="space-y-1.5">
                {stats.customerDietaryNotes.map((entry) => (
                  <li
                    key={`${entry.customerName}-${entry.note}`}
                    className="rounded-md border border-espresso/10 bg-linen/40 px-3 py-2"
                  >
                    <span className="font-semibold text-espresso">
                      {entry.customerName}
                    </span>
                    <span className="text-caption">
                      {" "}
                      · {formatMethod(entry.fulfillmentMethod)}
                    </span>
                    <span className="block mt-0.5 text-charcoal">
                      {entry.note}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li className="flex gap-2">
              <span className="text-blush font-medium shrink-0">
                Customer dietary notes:
              </span>
              <span>No notes submitted this week.</span>
            </li>
          )}
        </ul>
      </DashboardCard>
    </div>
  )
}

function RecentOrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-espresso/20 text-caption text-xs uppercase tracking-wide">
              <th className="px-3 py-2 font-medium">Customer</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Fulfillment</th>
              <th className="px-3 py-2 font-medium">Payment</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.internalRef}
                className={`border-b border-espresso/10 ${
                  index % 2 === 0 ? "bg-warm-white" : "bg-linen/35"
                }`}
              >
                <td className="px-3 py-3 font-medium">{order.customerName || "—"}</td>
                <td className="px-3 py-3 text-caption max-w-[240px] truncate">
                  {order.itemsSummary || "—"}
                </td>
                <td className="px-3 py-3 tabular-nums">{order.totalQuantity || "—"}</td>
                <td className="px-3 py-3">{formatMethod(order.fulfillmentMethod)}</td>
                <td className="px-3 py-3">
                  <StatusPill status={formatPaymentLabel(order.paymentStatus)} />
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={order.orderStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-3">
        {orders.map((order, index) => (
          <li
            key={order.internalRef}
            className={`rounded-lg border border-espresso/15 p-4 text-sm ${
              index % 2 === 0 ? "bg-warm-white" : "bg-linen/45"
            }`}
          >
            <p className="font-semibold text-espresso text-lg">
              {order.customerName || "Customer"}
            </p>
            <p className="text-caption mt-2 line-clamp-3">
              {order.itemsSummary || "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-caption">
              <span>Qty {order.totalQuantity || "—"}</span>
              <span>·</span>
              <span>{formatMethod(order.fulfillmentMethod)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill status={formatPaymentLabel(order.paymentStatus)} />
              <StatusPill status={order.orderStatus} />
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
  )
}

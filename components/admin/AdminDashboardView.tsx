import Link from "next/link"
import DashboardWeekOverview from "@/components/admin/DashboardWeekOverview"
import { buildDashboardWeekContext } from "@/lib/admin/dashboard-week-context"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import StatusPill from "@/components/admin/ui/StatusPill"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import {
  formatPaymentLabel,
  type DashboardStats,
} from "@/lib/admin/dashboard-stats"
import type { WeekGoalProgress } from "@/lib/admin/bakery-goals"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
import {
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/components/admin/ui/admin-button"

interface AdminDashboardViewProps {
  stats: DashboardStats
  loadError: string | null
  greeting: string
  orderingClosesIn: string | null
  weekGoalProgress: WeekGoalProgress | null
  usingDefaultBackup: boolean
}

function formatMethod(method: string): string {
  if (method === "delivery") return "Delivery"
  if (method === "pickup") return "Pickup"
  return method || "—"
}

export default function AdminDashboardView({
  stats,
  loadError,
  greeting,
  orderingClosesIn,
  weekGoalProgress,
  usingDefaultBackup,
}: AdminDashboardViewProps) {
  const weekContext = loadError
    ? null
    : buildDashboardWeekContext(stats, { orderingClosesIn })

  return (
    <div className="space-y-6" data-sop="admin-dashboard-page">
      <header className="flex flex-col gap-4 border-b border-espresso/15 pb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-caption text-sm">{greeting}</p>
          <h1 className="font-heading text-2xl sm:text-3xl text-espresso mt-1">
            {stats.batchLabel || "This bake week"}
          </h1>
          {weekContext ? (
            <p className="text-sm text-charcoal/80 font-body mt-2 max-w-xl leading-relaxed">
              {weekContext.phaseDescription}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
          <Link href="/admin/orders" className={`${adminBtnPrimary} w-full sm:w-auto`}>
            Orders
          </Link>
          <Link
            href="/admin/production"
            className={`${adminBtnSecondary} w-full sm:w-auto`}
          >
            Production
          </Link>
          <Link href="/admin/financials" className={`${adminBtnSecondary} w-full sm:w-auto`}>
            Financials
          </Link>
        </div>
      </header>

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
          {loadError}
        </p>
      ) : (
        <>
          <DashboardWeekOverview
            stats={stats}
            orderingClosesIn={orderingClosesIn}
            weekGoalProgress={weekGoalProgress}
            usingDefaultBackup={usingDefaultBackup}
          />

          <AdminPortalSection
            title="Latest orders"
            subtitle="Most recent for this bake week"
            collapsible={false}
          >
            <DashboardCard>
              {stats.recentOrders.length === 0 ? (
                <EmptyState
                  title="No orders yet"
                  message="They will show up here after customers check out."
                />
              ) : (
                <>
                  <RecentOrdersTable orders={stats.recentOrders} />
                  {stats.totalOrders > stats.recentOrders.length ? (
                    <p className="text-caption text-xs text-center mt-4 font-body">
                      Showing {stats.recentOrders.length} of {stats.totalOrders}.{" "}
                      <Link
                        href="/admin/orders"
                        className="font-semibold text-espresso hover:underline"
                      >
                        View all
                      </Link>
                    </p>
                  ) : null}
                </>
              )}
            </DashboardCard>
          </AdminPortalSection>
        </>
      )}
    </div>
  )
}

function RecentOrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-sm font-body">
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
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.internalRef)}`}
                    className="font-medium text-espresso hover:underline"
                  >
                    {order.customerName || "—"}
                  </Link>
                </td>
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
              Open
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

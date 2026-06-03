import Link from "next/link"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { adminBtnPrimary } from "@/components/admin/ui/admin-button"
import { buildDashboardStats } from "@/lib/admin/dashboard-stats"
import { fetchCurrentWeekAdminData } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

export default async function AdminProductionPage() {
  let batchLabel = ""
  let fulfillmentDate = ""
  let loadError: string | null = null
  let orders: Awaited<ReturnType<typeof fetchCurrentWeekAdminData>>["orders"] =
    []
  let lineItems: Awaited<
    ReturnType<typeof fetchCurrentWeekAdminData>
  >["lineItems"] = []

  try {
    const data = await fetchCurrentWeekAdminData()
    batchLabel = data.batchLabel
    fulfillmentDate = data.fulfillmentDate
    orders = data.orders
    lineItems = data.lineItems
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load production data."
  }

  const stats = buildDashboardStats(
    orders,
    batchLabel,
    fulfillmentDate,
    lineItems
  )

  return (
    <>
      <SectionHeader
        title="Production"
        subtitle="Bake list and prep timing for this week's fulfillment"
        action={
          <Link href="/admin" className={adminBtnPrimary}>
            Dashboard
          </Link>
        }
      />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : null}

      <DashboardCard title="Bake quantities" subtitle={stats.prepDayLabel}>
        <p className="text-sm text-olive/90 mb-4">
          Fulfillment:{" "}
          <span className="font-medium text-charcoal">{stats.batchLabel}</span>
          {" · "}
          <span className="tabular-nums">{stats.itemsToBake} items total</span>
        </p>
        {stats.productionList.length === 0 ? (
          <EmptyState
            title="Nothing to bake yet"
            message="Production quantities appear when orders are placed."
          />
        ) : (
          <ul className="space-y-2">
            {stats.productionList.map((item) => (
              <li
                key={item.name}
                className="flex justify-between gap-3 rounded-soft bg-linen/40 px-4 py-3 text-sm"
              >
                <span className="text-charcoal font-medium">{item.name}</span>
                <span className="tabular-nums text-lg font-heading">
                  {item.qty}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </>
  )
}

import Link from "next/link"
import { Suspense } from "react"
import AdminWeekSelector from "@/components/admin/AdminWeekSelector"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
import ProductionBakeListPrint from "@/components/admin/ProductionBakeListPrint"
import { buildDashboardStats } from "@/lib/admin/dashboard-stats"
import { packSizeForItem } from "@/lib/admin/production-pack-size"
import { loadAdminWeekData } from "@/lib/admin/load-admin-week"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams?: { week?: string }
}

export default async function AdminProductionPage({
  searchParams,
}: PageProps) {
  let batchLabel = ""
  let fulfillmentDate = ""
  let loadError: string | null = null
  let orders: Awaited<ReturnType<typeof loadAdminWeekData>>["orders"] = []
  let lineItems: Awaited<ReturnType<typeof loadAdminWeekData>>["lineItems"] = []
  let weekOptions: Awaited<ReturnType<typeof loadAdminWeekData>>["weekOptions"] =
    []
  let activeWeekKey = ""
  let currentWeekKey = ""

  try {
    const data = await loadAdminWeekData(searchParams?.week)
    batchLabel = data.batchLabel
    fulfillmentDate = data.fulfillmentDate
    orders = data.orders
    lineItems = data.lineItems
    weekOptions = data.weekOptions
    activeWeekKey = data.selectedWeek.weekKey
    currentWeekKey = data.currentWeekKey
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
        subtitle="Bake list and prep timing for the selected bake week"
        action={
          <ProductionBakeListPrint
            batchLabel={stats.batchLabel}
            prepDayLabel={stats.prepDayLabel}
            itemsToBake={stats.itemsToBake}
            productionList={stats.productionList}
          />
        }
        secondaryAction={
          <Link href="/admin" className={adminBtnSecondary}>
            Dashboard
          </Link>
        }
      />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : null}

      {weekOptions.length > 0 ? (
        <Suspense fallback={null}>
          <AdminWeekSelector
            weekOptions={weekOptions}
            activeWeekKey={activeWeekKey}
            currentWeekKey={currentWeekKey}
            basePath="/admin/production"
          />
        </Suspense>
      ) : null}

      <div className={stats.productionList.length === 0 ? "max-w-3xl" : ""}>
        <DashboardCard title="Production workspace" subtitle={stats.prepDayLabel}>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border border-espresso/15 bg-linen/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Fulfillment
              </p>
              <p className="font-semibold text-espresso">{stats.batchLabel}</p>
            </div>
            <div className="rounded-md border border-espresso/15 bg-linen/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Total items
              </p>
              <p className="font-semibold text-espresso tabular-nums">
                {stats.itemsToBake}
              </p>
            </div>
            <div className="rounded-md border border-espresso/15 bg-linen/40 px-3 py-2">
              <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Source
              </p>
              <p className="font-semibold text-espresso">Paid order lines</p>
            </div>
          </div>
          {stats.productionList.length === 0 ? (
            <EmptyState
              title="Nothing to bake yet"
              message="Production quantities appear when orders are placed."
            />
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-lg border border-espresso/15">
                <table className="w-full text-left text-sm min-w-[720px]">
                  <thead className="bg-sage-deep text-cream">
                    <tr>
                      <th className="px-3 py-3 font-semibold w-16">Done</th>
                      <th className="px-3 py-3 font-semibold">Item</th>
                      <th className="px-3 py-3 font-semibold text-right">Qty</th>
                      <th className="px-3 py-3 font-semibold">Pack size</th>
                      <th className="px-3 py-3 font-semibold">Prep notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productionList.map((item, index) => (
                      <tr
                        key={item.name}
                        className={`border-t border-espresso/15 ${
                          index % 2 === 0 ? "bg-warm-white" : "bg-linen/45"
                        }`}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Mark ${item.name} complete`}
                            className="h-5 w-5 rounded border-espresso/30 text-sage-deep"
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-espresso">
                          {item.name}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-heading text-xl text-espresso">
                          {item.qty}
                        </td>
                        <td className="px-3 py-3 text-espresso/80">
                          {packSizeForItem(item.name)}
                        </td>
                        <td className="px-3 py-3 text-caption">
                          Confirm labels, allergy notes, and pickup vs delivery
                          before packing.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden space-y-3">
                {stats.productionList.map((item, index) => (
                  <li
                    key={item.name}
                    className={`rounded-lg border border-espresso/15 p-4 ${
                      index % 2 === 0 ? "bg-warm-white" : "bg-linen/45"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        aria-label={`Mark ${item.name} complete`}
                        className="mt-1 h-6 w-6 shrink-0 rounded border-espresso/30 text-sage-deep"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-espresso text-lg leading-snug">
                          {item.name}
                        </p>
                        <p className="font-heading text-3xl text-espresso tabular-nums mt-2">
                          {item.qty}
                        </p>
                        <p className="text-sm text-espresso/80 mt-1">
                          Pack: {packSizeForItem(item.name)}
                        </p>
                        <p className="text-caption text-xs mt-2">
                          Confirm labels, allergy notes, and pickup vs delivery
                          before packing.
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </DashboardCard>
      </div>
    </>
  )
}

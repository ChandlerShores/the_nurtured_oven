import { Suspense } from "react"
import AdminPickupView from "@/components/admin/AdminPickupView"
import AdminWeekSelector from "@/components/admin/AdminWeekSelector"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { loadAdminWeekData } from "@/lib/admin/load-admin-week"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams?: { week?: string }
}

export default async function AdminPickupPage({ searchParams }: PageProps) {
  let batchLabel = ""
  let orders: Awaited<ReturnType<typeof loadAdminWeekData>>["orders"] = []
  let weekOptions: Awaited<ReturnType<typeof loadAdminWeekData>>["weekOptions"] =
    []
  let activeWeekKey = ""
  let currentWeekKey = ""
  let loadError: string | null = null

  try {
    const data = await loadAdminWeekData(searchParams?.week)
    batchLabel = data.batchLabel
    orders = data.orders
    weekOptions = data.weekOptions
    activeWeekKey = data.selectedWeek.weekKey
    currentWeekKey = data.currentWeekKey
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load pickup orders."
  }

  return (
    <>
      <SectionHeader title="Pickup" />

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
            basePath="/admin/pickup"
          />
        </Suspense>
      ) : null}

      {!loadError ? (
        <AdminPickupView
          orders={orders}
          batchLabel={batchLabel}
          weekKey={activeWeekKey}
        />
      ) : null}
    </>
  )
}

import { Suspense } from "react"
import AdminMessagesView from "@/components/admin/AdminMessagesView"
import AdminWeekSelector from "@/components/admin/AdminWeekSelector"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { loadAdminMessagesData } from "@/lib/admin/load-admin-messages"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams?: { week?: string }
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  let batchLabel = ""
  let items: Awaited<ReturnType<typeof loadAdminMessagesData>>["items"] = []
  let stats: Awaited<ReturnType<typeof loadAdminMessagesData>>["stats"] = {
    total: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  }
  let weekOptions: Awaited<
    ReturnType<typeof loadAdminMessagesData>
  >["weekOptions"] = []
  let activeWeekKey = ""
  let currentWeekKey = ""
  let orders: Awaited<ReturnType<typeof loadAdminMessagesData>>["orders"] = []
  let loadError: string | null = null

  try {
    const data = await loadAdminMessagesData(searchParams?.week)
    batchLabel = data.batchLabel
    orders = data.orders
    items = data.items
    stats = data.stats
    weekOptions = data.weekOptions
    activeWeekKey = data.selectedWeek.weekKey
    currentWeekKey = data.currentWeekKey
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load messages from Google Sheets."
  }

  return (
    <>
      <SectionHeader title="Messages" />

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
            basePath="/admin/messages"
          />
        </Suspense>
      ) : null}

      {!loadError ? (
        <AdminMessagesView
          orders={orders}
          items={items}
          stats={stats}
          batchLabel={batchLabel || "this week"}
        />
      ) : null}
    </>
  )
}

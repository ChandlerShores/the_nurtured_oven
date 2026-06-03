import AdminDeliveriesView from "@/components/admin/AdminDeliveriesView"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { fetchCurrentWeekOrders } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

export default async function AdminDeliveriesPage() {
  let batchLabel = ""
  let orders: Awaited<ReturnType<typeof fetchCurrentWeekOrders>>["orders"] = []
  let loadError: string | null = null

  try {
    const data = await fetchCurrentWeekOrders()
    batchLabel = data.batchLabel
    orders = data.orders
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load delivery orders."
  }

  return (
    <>
      <SectionHeader
        title="Deliveries"
        subtitle="Friday routes and drop-off status for this week's batch"
      />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : (
        <AdminDeliveriesView orders={orders} batchLabel={batchLabel} />
      )}
    </>
  )
}

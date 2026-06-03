import { redirect } from "next/navigation"
import AdminOrdersTable from "@/components/admin/AdminOrdersTable"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { fetchCurrentWeekOrders } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login?next=/admin/orders")
  }

  let batchLabel = ""
  let orders: Awaited<ReturnType<typeof fetchCurrentWeekOrders>>["orders"] = []
  let loadError: string | null = null

  try {
    const data = await fetchCurrentWeekOrders()
    batchLabel = data.batchLabel
    orders = data.orders
  } catch (err) {
    loadError =
      err instanceof Error
        ? err.message
        : "Could not load orders from Google Sheets."
  }

  return (
    <>
      <SectionHeader
        title="Orders"
        subtitle={
          batchLabel
            ? `Manage this week's batch · ${batchLabel}`
            : "Manage customer orders for the current bake week"
        }
      />

      {loadError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {loadError}
        </p>
      ) : null}

      <AdminOrdersTable orders={orders} batchLabel={batchLabel || "this week"} />
    </>
  )
}

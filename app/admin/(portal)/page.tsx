import { redirect } from "next/navigation"
import AdminDashboardView from "@/components/admin/AdminDashboardView"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { buildDashboardStats } from "@/lib/admin/dashboard-stats"
import { fetchCurrentWeekAdminData } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

function dashboardGreeting(): string {
  const now = new Date()
  const hour = now.getHours()
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now)
  const salutation =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  return `${salutation} · ${day}`
}

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }

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
      err instanceof Error
        ? err.message
        : "Could not load orders from Google Sheets."
  }

  const stats = buildDashboardStats(
    orders,
    batchLabel,
    fulfillmentDate,
    lineItems
  )

  return (
    <AdminDashboardView
      stats={stats}
      loadError={loadError}
      greeting={dashboardGreeting()}
    />
  )
}

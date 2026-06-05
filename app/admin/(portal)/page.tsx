import AdminDashboardView from "@/components/admin/AdminDashboardView"
import {
  buildWeekGoalProgress,
  getBakeryWeekGoalsFromEnv,
} from "@/lib/admin/bakery-goals"
import { loadWeeklyGoalsContext } from "@/lib/admin/load-bakery-week-goals"
import { buildDashboardStats } from "@/lib/admin/dashboard-stats"
import { getOrderingWindowClosesInLabel } from "@/lib/admin/ordering-pulse"
import { fetchCurrentWeekAdminData } from "@/lib/google-sheets/orders"

export const dynamic = "force-dynamic"

function dashboardGreeting(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())
}

export default async function AdminDashboardPage() {
  let batchLabel = ""
  let fulfillmentDate = ""
  let loadError: string | null = null
  let orders: Awaited<ReturnType<typeof fetchCurrentWeekAdminData>>["orders"] =
    []
  let lineItems: Awaited<
    ReturnType<typeof fetchCurrentWeekAdminData>
  >["lineItems"] = []
  let weekGoalProgress: ReturnType<typeof buildWeekGoalProgress> = null
  const orderingClosesIn = getOrderingWindowClosesInLabel()
  let weekGoals = getBakeryWeekGoalsFromEnv()
  let usingDefaultBackup = false

  try {
    const data = await fetchCurrentWeekAdminData()
    batchLabel = data.batchLabel
    fulfillmentDate = data.fulfillmentDate
    orders = data.orders
    lineItems = data.lineItems
    const ctx = await loadWeeklyGoalsContext(fulfillmentDate, batchLabel)
    weekGoals = ctx.effective
    usingDefaultBackup = ctx.usingDefaultBackup
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

  weekGoalProgress = buildWeekGoalProgress(
    stats.revenueCents,
    stats.paidOrderCount,
    weekGoals
  )

  return (
    <AdminDashboardView
      stats={stats}
      loadError={loadError}
      greeting={dashboardGreeting()}
      orderingClosesIn={orderingClosesIn}
      weekGoalProgress={weekGoalProgress}
      usingDefaultBackup={usingDefaultBackup}
    />
  )
}

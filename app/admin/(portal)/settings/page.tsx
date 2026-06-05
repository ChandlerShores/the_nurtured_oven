import type { ReactNode } from "react"
import AdminOrderingControls from "@/components/admin/AdminOrderingControls"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import AdminPortalSection from "@/components/admin/ui/AdminPortalSection"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import StatusPill from "@/components/admin/ui/StatusPill"
import { getOrderingKillSwitchState } from "@/lib/admin/ordering-kill-switch"
import { toAdminMenuItemView } from "@/lib/admin/menu-present"
import { fetchAllMenuRowsFromSheet } from "@/lib/google-sheets/menu-admin"
import { loadWeeklyGoalsContext } from "@/lib/admin/load-bakery-week-goals"
import { fetchAllOrdersFromSheet } from "@/lib/google-sheets/orders"
import { listFulfillmentWeekOptions } from "@/lib/admin/fulfillment-weeks"
import { operationalFulfillmentWeekKey } from "@/lib/admin/fulfillment-weeks"
import AdminDefaultGoalsBackup from "@/components/admin/AdminDefaultGoalsBackup"
import { getWeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const sheetConfigured = Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  )
  const emailConfigured = Boolean(process.env.RESEND_API_KEY)
  const redisConfigured = Boolean(process.env.REDIS_URL)
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

  let menuItems: ReturnType<typeof toAdminMenuItemView>[] = []
  let menuError: string | null = null
  const killSwitch = await getOrderingKillSwitchState()
  const ctx = getWeeklyFulfillmentContext()
  let budgetingSection: ReactNode = null

  try {
    const data = await fetchAllMenuRowsFromSheet()
    menuItems = data.rows.map(toAdminMenuItemView)
  } catch (err) {
    menuError =
      err instanceof Error ? err.message : "Could not load menu for controls."
  }

  if (sheetConfigured) {
    try {
      const allOrders = await fetchAllOrdersFromSheet()
      const weekOptions = listFulfillmentWeekOptions(allOrders)
      const operationalKey = operationalFulfillmentWeekKey()
      const selected =
        weekOptions.find((w) => w.weekKey === operationalKey) ??
        weekOptions.find((w) => w.fulfillmentDate === ctx.fulfillmentDate) ??
        weekOptions[0]
      const fulfillmentDate =
        selected?.fulfillmentDate ?? ctx.fulfillmentDate
      const batchLabel = selected?.batchLabel ?? ctx.batchLabel
      const goalsCtx = await loadWeeklyGoalsContext(
        fulfillmentDate,
        batchLabel
      )

      budgetingSection = (
        <AdminPortalSection title="Budgeting" first={Boolean(menuError)}>
          <AdminDefaultGoalsBackup
            defaultBackup={goalsCtx.defaultBackup}
            updatedAt={goalsCtx.defaultRowUpdatedAt}
          />
        </AdminPortalSection>
      )
    } catch (err) {
      budgetingSection = (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3 mb-8">
          {err instanceof Error
            ? err.message
            : "Could not load Weekly Goals from Sheets."}
        </p>
      )
    }
  }

  const orderingFirst = !menuError

  return (
    <>
      <SectionHeader title="Admin notes" />

      <div className="pb-4">
        {menuError ? (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
            {menuError}
          </p>
        ) : (
          <AdminPortalSection first={orderingFirst} title="Ordering & menu">
            <AdminOrderingControls
              killSwitch={killSwitch}
              menuItems={menuItems}
            />
          </AdminPortalSection>
        )}

        {budgetingSection}

        <AdminPortalSection title="Portal & integrations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <DashboardCard title="Notifications">
              <ul className="space-y-3 text-sm">
                <li className="flex items-center justify-between gap-3 border-b border-espresso/10 pb-3">
                  <p className="font-semibold text-espresso">Paid order emails</p>
                  <StatusPill status={emailConfigured ? "Active" : "Missing data"} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-espresso">Customer updates</p>
                  <StatusPill status={emailConfigured ? "Active" : "Missing data"} />
                </li>
              </ul>
            </DashboardCard>

            <DashboardCard title="Sync status">
              <ul className="space-y-3 text-sm">
                <SyncRow label="Google Sheets" active={sheetConfigured} />
                <SyncRow label="Resend email" active={emailConfigured} />
                <SyncRow
                  label="Redis (kill switch & rate limits)"
                  active={redisConfigured}
                />
                <SyncRow label="Vercel Blob uploads" active={blobConfigured} optional />
              </ul>
            </DashboardCard>
          </div>
        </AdminPortalSection>
      </div>
    </>
  )
}

function SyncRow({
  label,
  active,
  optional = false,
}: {
  label: string
  active: boolean
  optional?: boolean
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-espresso/10 pb-3 last:border-b-0 last:pb-0">
      <div>
        <p className="font-semibold text-espresso">{label}</p>
        {optional ? (
          <p className="text-caption text-xs">Optional for local workflows</p>
        ) : null}
      </div>
      <StatusPill status={active ? "Active" : optional ? "Hidden" : "Missing data"} />
    </li>
  )
}

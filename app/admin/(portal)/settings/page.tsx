import AdminOrderingControls from "@/components/admin/AdminOrderingControls"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import AdminLogoutButton from "@/components/admin/AdminLogoutButton"
import StatusPill from "@/components/admin/ui/StatusPill"
import { getOrderingKillSwitchState } from "@/lib/admin/ordering-kill-switch"
import { toAdminMenuItemView } from "@/lib/admin/menu-present"
import { fetchAllMenuRowsFromSheet } from "@/lib/google-sheets/menu-admin"

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

  try {
    const data = await fetchAllMenuRowsFromSheet()
    menuItems = data.rows.map(toAdminMenuItemView)
  } catch (err) {
    menuError =
      err instanceof Error ? err.message : "Could not load menu for controls."
  }

  return (
    <>
      <SectionHeader
        title="Admin notes"
        subtitle="Ordering controls, account access, and sync status"
      />

      {menuError ? (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-6">
          {menuError}
        </p>
      ) : (
        <div className="mb-8">
          <AdminOrderingControls
            killSwitch={killSwitch}
            menuItems={menuItems}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardCard title="Account">
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Portal access
              </p>
              <p className="font-semibold text-espresso mt-1">Shared baker login</p>
              <p className="text-caption mt-1">
                Session cookie lasts three days. Sign out when finished on shared devices.
              </p>
            </div>
            <AdminLogoutButton />
          </div>
        </DashboardCard>

        <DashboardCard title="Notifications">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-between gap-3 border-b border-espresso/10 pb-3">
              <div>
                <p className="font-semibold text-espresso">Paid order emails</p>
                <p className="text-caption">Owner and customer confirmation emails via Resend.</p>
              </div>
              <StatusPill status={emailConfigured ? "Active" : "Missing data"} />
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-espresso">Customer updates</p>
                <p className="text-caption">Ready, delivery, and custom messages from order detail.</p>
              </div>
              <StatusPill status={emailConfigured ? "Active" : "Missing data"} />
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard title="Business details">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-espresso/10 bg-linen/35 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Ordering window
              </dt>
              <dd className="font-semibold text-espresso">Fri 9 AM - Wed noon ET</dd>
            </div>
            <div className="rounded-md border border-espresso/10 bg-linen/35 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Fulfillment
              </dt>
              <dd className="font-semibold text-espresso">Friday pickup / delivery</dd>
            </div>
            <div className="rounded-md border border-espresso/10 bg-linen/35 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Menu source
              </dt>
              <dd className="font-semibold text-espresso">Google Sheets Menu tab</dd>
            </div>
            <div className="rounded-md border border-espresso/10 bg-linen/35 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
                Payment
              </dt>
              <dd className="font-semibold text-espresso">Square hosted checkout</dd>
            </div>
          </dl>
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
        {optional ? <p className="text-caption text-xs">Optional for local workflows</p> : null}
      </div>
      <StatusPill status={active ? "Active" : optional ? "Hidden" : "Missing data"} />
    </li>
  )
}

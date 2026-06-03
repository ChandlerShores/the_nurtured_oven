import DashboardCard from "@/components/admin/ui/DashboardCard"
import SectionHeader from "@/components/admin/ui/SectionHeader"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="Portal preferences and account options"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DashboardCard title="Baker portal">
          <ul className="space-y-4 text-sm text-charcoal/90">
            <li>
              <p className="font-medium text-charcoal">Weekly data</p>
              <p className="text-caption mt-1">
                Orders, menu, financials, and customer emails sync from Google
                Sheets. Edits in admin save back automatically.
              </p>
            </li>
            <li>
              <p className="font-medium text-charcoal">Financial tabs</p>
              <p className="text-caption mt-1">
                Run{" "}
                <code className="text-xs bg-linen/80 px-1 rounded">
                  pnpm sheets:seed-financials
                </code>{" "}
                once if Product Costs or Weekly Expenses tabs are empty.
              </p>
            </li>
            <li>
              <p className="font-medium text-charcoal">Sign out</p>
              <p className="text-caption mt-1">
                Use Sign out in the sidebar when you are done for the day.
              </p>
            </li>
          </ul>
        </DashboardCard>

        <DashboardCard title="Security & environment">
          <ul className="space-y-3 text-sm text-charcoal/90">
            <li>
              <p className="font-medium text-charcoal">Production checklist</p>
              <p className="text-caption mt-1">
                Use a 12+ character <code className="text-xs">ADMIN_PASSWORD</code>{" "}
                and a separate 32+ character{" "}
                <code className="text-xs">ADMIN_SESSION_SECRET</code> on Vercel.
              </p>
            </li>
            <li>
              <p className="text-caption">
                Local verify:{" "}
                <code className="text-xs bg-linen/80 px-1 rounded">
                  pnpm env:check
                </code>
                ,{" "}
                <code className="text-xs bg-linen/80 px-1 rounded">
                  pnpm typecheck
                </code>
              </p>
            </li>
            <li className="text-caption">
              Docs in repo: <span className="text-charcoal">docs/ENV.md</span>,{" "}
              <span className="text-charcoal">docs/SECURITY.md</span>
            </li>
          </ul>
        </DashboardCard>
      </div>
    </>
  )
}

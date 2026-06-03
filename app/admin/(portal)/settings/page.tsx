import { redirect } from "next/navigation"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import SectionHeader from "@/components/admin/ui/SectionHeader"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login?next=/admin/settings")
  }

  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="Portal preferences and account options"
      />

      <DashboardCard title="Baker portal">
        <ul className="space-y-4 text-sm text-charcoal/90">
          <li>
            <p className="font-medium text-charcoal">Weekly data</p>
            <p className="text-caption mt-1">
              Orders and menu sync from your connected spreadsheet. Edits here
              save back automatically.
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
    </>
  )
}

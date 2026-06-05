import Link from "next/link"
import { FINANCIALS_WEEKLY_GOALS_SECTION_ID } from "@/components/admin/financials/FinancialsSection"
import type { WeekGoalProgress } from "@/lib/admin/bakery-goals"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import { adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { ProgressBars } from "@/components/admin/WeekGoalProgressBars"

interface WeekGoalProgressProps {
  progress: WeekGoalProgress
  batchLabel: string
  usingDefaultBackup?: boolean
  editGoalsHref?: string
  showSubtitle?: boolean
}

export default function WeekGoalProgressCard({
  progress,
  batchLabel,
  usingDefaultBackup = false,
  editGoalsHref = `/admin/financials#${FINANCIALS_WEEKLY_GOALS_SECTION_ID}`,
  showSubtitle = true,
}: WeekGoalProgressProps) {
  return (
    <DashboardCard
      title="Week goal"
      subtitle={
        showSubtitle
          ? `Progress for ${batchLabel}${usingDefaultBackup ? " (default backup targets)" : ""}`
          : undefined
      }
    >
      <ProgressBars progress={progress} />
      <div className="mt-4 pt-4 border-t border-espresso/10">
        <Link href={editGoalsHref} className={adminBtnSecondary}>
          Edit bake week goals
        </Link>
      </div>
    </DashboardCard>
  )
}

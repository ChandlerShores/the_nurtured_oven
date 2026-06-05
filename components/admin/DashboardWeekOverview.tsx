import Link from "next/link"
import DashboardNeedsAttention from "@/components/admin/DashboardNeedsAttention"
import { ProgressBars } from "@/components/admin/WeekGoalProgressBars"
import { FINANCIALS_WEEKLY_GOALS_SECTION_ID } from "@/components/admin/financials/FinancialsSection"
import { buildDashboardWeekContext } from "@/lib/admin/dashboard-week-context"
import { weekGoalsConfigured } from "@/lib/admin/dashboard-week-context"
import type { WeekGoalProgress } from "@/lib/admin/bakery-goals"
import type { DashboardStats } from "@/lib/admin/dashboard-stats"

interface DashboardWeekOverviewProps {
  stats: DashboardStats
  orderingClosesIn?: string | null
  weekGoalProgress: WeekGoalProgress | null
  usingDefaultBackup: boolean
}

export default function DashboardWeekOverview({
  stats,
  orderingClosesIn,
  weekGoalProgress,
  usingDefaultBackup,
}: DashboardWeekOverviewProps) {
  const week = buildDashboardWeekContext(stats, { orderingClosesIn })
  const showGoals = weekGoalsConfigured(weekGoalProgress)

  return (
    <div className="space-y-5">
      <DashboardNeedsAttention
        stats={stats}
        orderingClosesIn={orderingClosesIn}
        weekPhase={week.phase}
      />

      {showGoals && weekGoalProgress ? (
        <div className="rounded-lg border border-espresso/12 bg-warm-white p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-espresso/70">
              Week goals
            </h2>
            <Link
              href={`/admin/financials#${FINANCIALS_WEEKLY_GOALS_SECTION_ID}`}
              className="text-xs font-semibold text-espresso hover:underline underline-offset-2"
            >
              Edit goals
              {usingDefaultBackup ? " (defaults)" : ""}
            </Link>
          </div>
          <ProgressBars progress={weekGoalProgress} />
        </div>
      ) : null}
    </div>
  )
}

import type { WeekGoalProgress } from "@/lib/admin/bakery-goals"

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div
      className="h-2 rounded-full bg-espresso/10 overflow-hidden"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-sage-deep transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export function ProgressBars({ progress }: { progress: WeekGoalProgress }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {progress.revenueGoalDisplay ? (
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Revenue
          </p>
          <p className="font-heading text-2xl text-espresso tabular-nums mt-1">
            {progress.revenueDisplay}{" "}
            <span className="text-base text-espresso/60">
              / {progress.revenueGoalDisplay}
            </span>
          </p>
          {progress.revenuePercent != null ? (
            <>
              <ProgressBar percent={progress.revenuePercent} />
              <p className="text-sm text-caption mt-1">
                {progress.revenuePercent}% of goal
              </p>
            </>
          ) : null}
        </div>
      ) : null}
      {progress.orderGoalLabel ? (
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Paid orders
          </p>
          <p className="font-heading text-2xl text-espresso tabular-nums mt-1">
            {progress.paidOrderCount}{" "}
            <span className="text-base text-espresso/60">
              / {progress.orderGoalLabel}
            </span>
          </p>
          {progress.orderPercent != null ? (
            <>
              <ProgressBar percent={progress.orderPercent} />
              <p className="text-sm text-caption mt-1">
                {progress.orderPercent}% of goal
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

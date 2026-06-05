"use client"

import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import { formatCentsDisplay } from "@/lib/admin/money"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"

interface WeeklyGoalsFormProps {
  revenueGoal: string
  orderGoalCount: string
  notes: string
  onRevenueChange: (value: string) => void
  onOrderChange: (value: string) => void
  onNotesChange: (value: string) => void
  onSave: () => void
  onClear?: () => void
  saveLabel?: string
  disabled?: boolean
  saving?: boolean
}

export function WeeklyGoalsForm({
  revenueGoal,
  orderGoalCount,
  notes,
  onRevenueChange,
  onOrderChange,
  onNotesChange,
  onSave,
  onClear,
  saveLabel = "Save goals",
  disabled = false,
  saving = false,
}: WeeklyGoalsFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Revenue goal ($)
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 400"
            value={revenueGoal}
            disabled={disabled || saving}
            onChange={(e) => onRevenueChange(e.target.value)}
            className="rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 min-h-[44px] text-base"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Order goal (count)
          </span>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 15"
            value={orderGoalCount}
            disabled={disabled || saving}
            onChange={(e) => onOrderChange(e.target.value)}
            className="rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 min-h-[44px] text-base"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
          Notes (optional)
        </span>
        <textarea
          rows={2}
          value={notes}
          disabled={disabled || saving}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Launch week, comfort box push, etc."
          className="rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 text-base resize-y"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={adminBtnPrimary}
          disabled={disabled || saving}
          onClick={onSave}
        >
          {saving ? "Saving…" : saveLabel}
        </button>
        {onClear ? (
          <button
            type="button"
            className={adminBtnSecondary}
            disabled={disabled || saving}
            onClick={onClear}
          >
            Clear fields
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function DefaultBackupSummary({
  backup,
}: {
  backup: BakeryWeekGoals
}) {
  const has =
    (backup.revenueGoalCents ?? 0) > 0 || (backup.orderGoalCount ?? 0) > 0
  if (!has) {
    return (
      <p className="text-caption text-xs rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2">
        No default backup row yet. Set one under Admin notes so weeks without
        their own targets still have a goal.
      </p>
    )
  }
  return (
    <p className="text-caption text-xs rounded-md border border-espresso/10 bg-linen/50 px-3 py-2">
      <span className="font-semibold text-espresso">Default backup:</span>{" "}
      {backup.revenueGoalCents
        ? formatCentsDisplay(backup.revenueGoalCents)
        : "—"}{" "}
      revenue
      {backup.orderGoalCount ? ` · ${backup.orderGoalCount} orders` : ""}
      {" — "}
      used only when this week has no saved targets.
    </p>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import {
  DefaultBackupSummary,
  WeeklyGoalsForm,
} from "@/components/admin/WeeklyGoalsForm"
import { dollarsFromCents } from "@/lib/admin/money"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"

export interface ThisWeekGoalsEditorProps {
  fulfillmentDate: string
  batchLabel: string
  weekTargets: BakeryWeekGoals
  defaultBackup: BakeryWeekGoals
  hasWeekSpecificRow: boolean
  usingDefaultBackup: boolean
  updatedAt: string | null
  /** When set, renders above the form. */
  progressSlot?: ReactNode
  compactTitle?: boolean
  /** Default backup card lives in Admin notes when false. */
  showDefaultBackup?: boolean
  /** Omit card title/subtitle when a parent section already labels this block. */
  showCardHeader?: boolean
}

export default function ThisWeekGoalsEditor({
  fulfillmentDate,
  batchLabel,
  weekTargets,
  defaultBackup,
  hasWeekSpecificRow,
  usingDefaultBackup,
  updatedAt,
  progressSlot,
  compactTitle = false,
  showDefaultBackup = true,
  showCardHeader = true,
}: ThisWeekGoalsEditorProps) {
  const router = useRouter()
  const [revenueGoal, setRevenueGoal] = useState(
    dollarsFromCents(weekTargets.revenueGoalCents)
  )
  const [orderGoalCount, setOrderGoalCount] = useState(
    weekTargets.orderGoalCount ? String(weekTargets.orderGoalCount) : ""
  )
  const [notes, setNotes] = useState(weekTargets.notes ?? "")
  const [phase, setPhase] = useState<"idle" | "saving">("idle")
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [updatedAtLocal, setUpdatedAtLocal] = useState(updatedAt)

  async function saveGoals() {
    setPhase("saving")
    setError(null)
    setSavedMsg(null)
    try {
      const res = await fetch("/api/admin/weekly-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentDate,
          batchLabel,
          revenueGoal,
          orderGoalCount: orderGoalCount.trim() || null,
          notes,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        saved?: { updatedAt?: string }
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save goals.")
      }
      setSavedMsg("Saved for this bake week.")
      setUpdatedAtLocal(data.saved?.updatedAt ?? new Date().toLocaleString())
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goals.")
    } finally {
      setPhase("idle")
    }
  }

  const statusLine = hasWeekSpecificRow
    ? `This week has its own targets${updatedAtLocal ? ` · updated ${updatedAtLocal}` : ""}.`
    : usingDefaultBackup
      ? showDefaultBackup
        ? "No targets for this week yet — progress uses your default backup below."
        : "No targets for this week yet — progress uses your default backup (Admin notes)."
      : showDefaultBackup
        ? "Set targets for this week, or configure a default backup in Admin notes."
        : "Set revenue and order targets for this bake week."

  const title = compactTitle ? "This week's goals" : "Goals for this bake week"
  const subtitle = compactTitle
    ? batchLabel
    : `Targets for ${batchLabel} — saved to the Weekly Goals sheet`

  const body = (
      <div className="space-y-4 text-sm">
        {progressSlot}
        {showDefaultBackup ? (
          <DefaultBackupSummary backup={defaultBackup} />
        ) : null}
        <p className="text-caption text-xs">{statusLine}</p>
        <WeeklyGoalsForm
          revenueGoal={revenueGoal}
          orderGoalCount={orderGoalCount}
          notes={notes}
          onRevenueChange={setRevenueGoal}
          onOrderChange={setOrderGoalCount}
          onNotesChange={setNotes}
          onSave={() => void saveGoals()}
          onClear={() => {
            setRevenueGoal("")
            setOrderGoalCount("")
            setNotes("")
          }}
          saveLabel="Save this week's goals"
          saving={phase === "saving"}
          disabled={phase === "saving"}
        />
        {error ? (
          <p className="text-red-800 bg-red-50 border border-red-200 rounded-soft px-3 py-2">
            {error}
          </p>
        ) : null}
        {savedMsg ? (
          <p className="text-sage-deep bg-sage/15 border border-sage/40 rounded-soft px-3 py-2">
            {savedMsg}
          </p>
        ) : null}
      </div>
  )

  if (!showCardHeader) {
    return (
      <div className="rounded-lg bg-warm-white border border-espresso/12 p-5 sm:p-6">
        {body}
      </div>
    )
  }

  return (
    <DashboardCard title={title} subtitle={subtitle}>
      {body}
    </DashboardCard>
  )
}

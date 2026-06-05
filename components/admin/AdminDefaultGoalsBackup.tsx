"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import { WeeklyGoalsForm } from "@/components/admin/WeeklyGoalsForm"
import { dollarsFromCents } from "@/lib/admin/money"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"

interface AdminDefaultGoalsBackupProps {
  defaultBackup: BakeryWeekGoals
  updatedAt: string | null
}

export default function AdminDefaultGoalsBackup({
  defaultBackup,
  updatedAt,
}: AdminDefaultGoalsBackupProps) {
  const router = useRouter()
  const [revenueGoal, setRevenueGoal] = useState(
    dollarsFromCents(defaultBackup.revenueGoalCents)
  )
  const [orderGoalCount, setOrderGoalCount] = useState(
    defaultBackup.orderGoalCount ? String(defaultBackup.orderGoalCount) : ""
  )
  const [notes, setNotes] = useState(defaultBackup.notes ?? "")
  const [phase, setPhase] = useState<"idle" | "saving">("idle")
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [updatedAtLocal, setUpdatedAtLocal] = useState(updatedAt)

  async function saveBackup() {
    setPhase("saving")
    setError(null)
    setSavedMsg(null)
    try {
      const res = await fetch("/api/admin/weekly-goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentDate: "default",
          batchLabel: "",
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
        throw new Error(data.error ?? "Could not save default backup.")
      }
      setSavedMsg("Default backup saved.")
      setUpdatedAtLocal(data.saved?.updatedAt ?? new Date().toLocaleString())
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save default backup."
      )
    } finally {
      setPhase("idle")
    }
  }

  return (
    <DashboardCard title="Default backup targets">
      <div className="space-y-4 text-sm">
        {updatedAtLocal ? (
          <p className="text-caption text-xs">Last updated {updatedAtLocal}.</p>
        ) : null}
        <WeeklyGoalsForm
          revenueGoal={revenueGoal}
          orderGoalCount={orderGoalCount}
          notes={notes}
          onRevenueChange={setRevenueGoal}
          onOrderChange={setOrderGoalCount}
          onNotesChange={setNotes}
          onSave={() => void saveBackup()}
          saveLabel="Save default backup"
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
    </DashboardCard>
  )
}

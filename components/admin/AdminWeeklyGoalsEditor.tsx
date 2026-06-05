"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import DashboardCard from "@/components/admin/ui/DashboardCard"
import { WeeklyGoalsForm } from "@/components/admin/WeeklyGoalsForm"
import { dollarsFromCents } from "@/lib/admin/money"
import type { BakeryWeekGoals } from "@/lib/admin/bakery-goals"
import type { FulfillmentWeekOption } from "@/lib/admin/financial-stats-types"

export interface WeeklyGoalsEditorInitial {
  fulfillmentDate: string
  batchLabel: string
  weekTargets: BakeryWeekGoals
  revenueGoalDollars: string
  orderGoalCount: string
  notes: string
  updatedAt: string | null
}

interface AdminWeeklyGoalsEditorProps {
  weekOptions: FulfillmentWeekOption[]
  initial: WeeklyGoalsEditorInitial
}

export default function AdminWeeklyGoalsEditor({
  weekOptions,
  initial,
}: AdminWeeklyGoalsEditorProps) {
  const router = useRouter()
  const [fulfillmentDate, setFulfillmentDate] = useState(
    initial.fulfillmentDate
  )
  const [batchLabel, setBatchLabel] = useState(initial.batchLabel)
  const [revenueGoal, setRevenueGoal] = useState(initial.revenueGoalDollars)
  const [orderGoalCount, setOrderGoalCount] = useState(initial.orderGoalCount)
  const [notes, setNotes] = useState(initial.notes)
  const [updatedAt, setUpdatedAt] = useState(initial.updatedAt)
  const [phase, setPhase] = useState<"idle" | "saving" | "loading">("idle")
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const applyWeek = useCallback(async (week: FulfillmentWeekOption) => {
    setPhase("loading")
    setError(null)
    setSavedMsg(null)
    try {
      const params = new URLSearchParams({
        fulfillmentDate: week.fulfillmentDate,
        batchLabel: week.batchLabel,
      })
      const res = await fetch(`/api/admin/weekly-goals?${params}`)
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        weekTargets?: BakeryWeekGoals
        fulfillmentDate?: string
        batchLabel?: string
        updatedAt?: string | null
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Could not load goals for that week.")
      }
      setFulfillmentDate(data.fulfillmentDate ?? week.fulfillmentDate)
      setBatchLabel(data.batchLabel ?? week.batchLabel)
      const targets = data.weekTargets
      setRevenueGoal(dollarsFromCents(targets?.revenueGoalCents ?? null))
      setOrderGoalCount(
        targets?.orderGoalCount ? String(targets.orderGoalCount) : ""
      )
      setNotes(targets?.notes ?? "")
      setUpdatedAt(data.updatedAt ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load goals.")
    } finally {
      setPhase("idle")
    }
  }, [])

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
      setUpdatedAt(data.saved?.updatedAt ?? new Date().toLocaleString())
      setSavedMsg("Goals saved for that bake week.")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goals.")
    } finally {
      setPhase("idle")
    }
  }

  const selectedKey =
    weekOptions.find(
      (w) =>
        w.fulfillmentDate === fulfillmentDate || w.batchLabel === batchLabel
    )?.weekKey ?? fulfillmentDate

  return (
    <DashboardCard
      title="Other bake weeks"
      subtitle="Edit historical or future weeks — each week has its own row in Weekly Goals"
    >
      <div className="space-y-4 text-sm">
        <label className="flex flex-col gap-1 max-w-md">
          <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
            Bake week
          </span>
          <select
            value={selectedKey}
            disabled={phase !== "idle"}
            onChange={(e) => {
              const week = weekOptions.find((w) => w.weekKey === e.target.value)
              if (week) void applyWeek(week)
            }}
            className="rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 min-h-[44px] text-base"
          >
            {weekOptions.map((w) => (
              <option key={w.weekKey} value={w.weekKey}>
                {w.batchLabel}
              </option>
            ))}
          </select>
        </label>

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
          disabled={phase !== "idle"}
          saving={phase === "saving"}
        />

        <p className="text-caption text-xs">
          Saves only this week&apos;s row — not the default backup.
          {updatedAt ? ` Last updated ${updatedAt}.` : ""}
        </p>

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

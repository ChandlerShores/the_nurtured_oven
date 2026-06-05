"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import type { FulfillmentWeekOption } from "@/lib/admin/financial-stats-types"
import {
  fulfillmentWeekKeysMatch,
  isViewingPriorBakeWeek,
} from "@/lib/admin/fulfillment-label-match"

interface AdminWeekSelectorProps {
  weekOptions: FulfillmentWeekOption[]
  activeWeekKey: string
  basePath:
    | "/admin/orders"
    | "/admin/pickup"
    | "/admin/deliveries"
    | "/admin/messages"
  currentWeekKey: string
}

export default function AdminWeekSelector({
  weekOptions,
  activeWeekKey,
  basePath,
  currentWeekKey,
}: AdminWeekSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onChange = useCallback(
    (weekKey: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (fulfillmentWeekKeysMatch(weekKey, currentWeekKey)) {
        params.delete("week")
      } else {
        params.set("week", weekKey)
      }
      const query = params.toString()
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      })
    },
    [router, searchParams, basePath, currentWeekKey]
  )

  if (weekOptions.length === 0) {
    return null
  }

  const viewingPrior = isViewingPriorBakeWeek(activeWeekKey, currentWeekKey)

  return (
    <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex flex-col gap-1 text-sm w-full sm:flex-1 sm:max-w-md">
        <span className="text-xs uppercase tracking-wide font-semibold text-espresso/70">
          Bake week
        </span>
        <select
          value={activeWeekKey}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-espresso/20 bg-warm-white px-3 py-2.5 min-h-[44px] text-base text-espresso font-body"
        >
          {weekOptions.map((week) => (
            <option key={week.weekKey} value={week.weekKey}>
              {week.batchLabel} ({week.paidOrderCount} order
              {week.paidOrderCount === 1 ? "" : "s"})
            </option>
          ))}
        </select>
      </label>
      {viewingPrior ? (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-soft px-3 py-2 w-full sm:flex-1 sm:min-w-[12rem]">
          Viewing a prior bake week. Switch back to the current week for live
          fulfillment work.
        </p>
      ) : null}
    </div>
  )
}

"use client"

import AdminCollapsibleFilters from "@/components/admin/ui/AdminCollapsibleFilters"
import {
  shouldShowSlicerGroup,
  type AdminOrderSlicerFilters,
  type OrderSlicerOption,
} from "@/lib/admin/order-filters"

export type { AdminOrderSlicerFilters } from "@/lib/admin/order-filters"

interface AdminOrderSlicerGroupProps {
  label: string
  options: OrderSlicerOption[]
  selected: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
  inline?: boolean
}

const chipBase =
  "rounded-full px-3 py-1.5 text-sm font-body transition-colors border"
const chipActive = "bg-sage-deep text-cream border-sage-deep"
const chipInactive =
  "bg-warm-white text-espresso border-oatmeal/80 hover:bg-linen/80"

function AdminOrderSlicerGroup({
  label,
  options,
  selected,
  onToggle,
  onClear,
  inline = false,
}: AdminOrderSlicerGroupProps) {
  const hasFilter = selected.size > 0

  return (
    <div className={inline ? "flex flex-wrap items-center gap-x-2 gap-y-2" : ""}>
      <p
        className={
          inline
            ? "text-caption text-xs uppercase tracking-wide shrink-0"
            : "text-caption text-xs uppercase tracking-wide mb-2"
        }
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        <button
          type="button"
          onClick={onClear}
          className={`${chipBase} ${!hasFilter ? chipActive : chipInactive}`}
          aria-pressed={!hasFilter}
        >
          All
        </button>
        {options.map((opt) => {
          const isOn = selected.has(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`${chipBase} ${isOn ? chipActive : chipInactive}`}
              aria-pressed={isOn}
            >
              {opt.label}
              <span className="ml-1 opacity-80 tabular-nums">({opt.count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface AdminOrderSlicersProps {
  statusOptions: OrderSlicerOption[]
  fulfillmentOptions: OrderSlicerOption[]
  filters: AdminOrderSlicerFilters
  onToggleStatus: (value: string) => void
  onToggleFulfillment: (value: string) => void
  onClearStatus: () => void
  onClearFulfillment: () => void
  onClearAll: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
}

export default function AdminOrderSlicers({
  statusOptions,
  fulfillmentOptions,
  filters,
  onToggleStatus,
  onToggleFulfillment,
  onClearStatus,
  onClearFulfillment,
  onClearAll,
  searchQuery,
  onSearchChange,
}: AdminOrderSlicersProps) {
  const hasSlicerFilter =
    filters.status.size > 0 || filters.fulfillment.size > 0
  const hasSearch = searchQuery.trim().length > 0
  const hasAnyFilter = hasSlicerFilter || hasSearch

  const showStatus = shouldShowSlicerGroup(statusOptions, filters.status)
  const showFulfillment = shouldShowSlicerGroup(
    fulfillmentOptions,
    filters.fulfillment
  )
  const showSlicerRow = showStatus || showFulfillment

  const filterSummary = (() => {
    const parts: string[] = []
    if (hasSearch) parts.push("Search")
    const chipCount = filters.status.size + filters.fulfillment.size
    if (chipCount > 0) {
      parts.push(`${chipCount} filter${chipCount === 1 ? "" : "s"}`)
    }
    return parts.length > 0 ? parts.join(" · ") : undefined
  })()

  return (
    <AdminCollapsibleFilters
      defaultOpen={hasAnyFilter}
      hasActiveFilters={hasAnyFilter}
      summary={filterSummary}
      className="mb-4"
    >
      <label className="block text-sm">
        <span className="sr-only">Search orders</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-soft border border-oatmeal/80 bg-warm-white px-3 py-2.5 min-h-[44px] text-base text-charcoal"
        />
      </label>

      {showSlicerRow ? (
        <div className="flex flex-col gap-3">
          {showStatus ? (
            <AdminOrderSlicerGroup
              label="Status"
              options={statusOptions}
              selected={filters.status}
              onToggle={onToggleStatus}
              onClear={onClearStatus}
              inline
            />
          ) : null}
          {showFulfillment ? (
            <AdminOrderSlicerGroup
              label="Fulfillment"
              options={fulfillmentOptions}
              selected={filters.fulfillment}
              onToggle={onToggleFulfillment}
              onClear={onClearFulfillment}
              inline
            />
          ) : null}
        </div>
      ) : null}

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm text-caption underline-offset-2 hover:underline font-body"
        >
          Clear all
        </button>
      ) : null}
    </AdminCollapsibleFilters>
  )
}

export function toggleFilterSet<T extends string>(
  current: Set<T>,
  value: T
): Set<T> {
  const next = new Set(current)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

"use client"

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
}: AdminOrderSlicerGroupProps) {
  const hasFilter = selected.size > 0

  return (
    <div>
      <p className="text-caption text-xs uppercase tracking-wide mb-2">{label}</p>
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
  filteredCount: number
  totalCount: number
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
  filteredCount,
  totalCount,
}: AdminOrderSlicersProps) {
  const hasAnyFilter =
    filters.status.size > 0 || filters.fulfillment.size > 0

  const showStatus = shouldShowSlicerGroup(statusOptions, filters.status)
  const showFulfillment = shouldShowSlicerGroup(
    fulfillmentOptions,
    filters.fulfillment
  )

  if (!showStatus && !showFulfillment) {
    return (
      <div className="rounded-soft border border-oatmeal/60 bg-linen/30 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-sm font-body">
          All {totalCount} orders shown — nothing to filter this week.
        </p>
        {hasAnyFilter ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm text-caption underline-offset-2 hover:underline font-body"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-soft border border-oatmeal/60 bg-linen/30 px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-espresso text-sm">Filter orders</p>
        <p className="text-caption text-sm">
          Showing {filteredCount} of {totalCount}
        </p>
      </div>

      <div
        className={`grid gap-4 ${
          showStatus && showFulfillment
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {showStatus ? (
          <AdminOrderSlicerGroup
            label="Status"
            options={statusOptions}
            selected={filters.status}
            onToggle={onToggleStatus}
            onClear={onClearStatus}
          />
        ) : null}
        {showFulfillment ? (
          <AdminOrderSlicerGroup
            label="Fulfillment"
            options={fulfillmentOptions}
            selected={filters.fulfillment}
            onToggle={onToggleFulfillment}
            onClear={onClearFulfillment}
          />
        ) : null}
      </div>

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm text-caption underline-offset-2 hover:underline font-body"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
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

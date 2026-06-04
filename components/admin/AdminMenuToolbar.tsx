"use client"

import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import type { MenuSearchScope } from "@/lib/admin/menu-search"

const SCOPES: { id: MenuSearchScope; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "On site" },
  { id: "hidden", label: "Hidden" },
]

interface AdminMenuToolbarProps {
  activeCount: number
  featuredName: string
  lastRefreshedLabel: string
  tabName: string
  totalCount: number
  matchCount: number
  searchQuery: string
  searchScope: MenuSearchScope
  refreshing: boolean
  onAddItem: () => void
  onRefresh: () => void
  onSearchChange: (value: string) => void
  onScopeChange: (scope: MenuSearchScope) => void
  onClearSearch: () => void
  onCollapseAll: () => void
  onExpandAll: () => void
}

function StatCell({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-md border border-espresso/10 bg-linen/45 px-3 py-2.5 min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-espresso/60">
        {label}
      </p>
      <p className="font-heading text-lg text-espresso mt-0.5 truncate leading-tight">
        {value}
      </p>
      {hint ? (
        <p className="text-caption text-[11px] mt-0.5 truncate">{hint}</p>
      ) : null}
    </div>
  )
}

export default function AdminMenuToolbar({
  activeCount,
  featuredName,
  lastRefreshedLabel,
  tabName,
  totalCount,
  matchCount,
  searchQuery,
  searchScope,
  refreshing,
  onAddItem,
  onRefresh,
  onSearchChange,
  onScopeChange,
  onClearSearch,
  onCollapseAll,
  onExpandAll,
}: AdminMenuToolbarProps) {
  const hasQuery = searchQuery.trim().length > 0

  return (
    <section className="rounded-lg border border-espresso/15 bg-warm-white shadow-gentle overflow-hidden mb-6">
      <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCell label="On site" value={activeCount} />
          <StatCell label="Featured" value={featuredName} />
          <StatCell label="Refreshed" value={lastRefreshedLabel} />
          <StatCell label="Source" value="Google Sheet" hint={`${tabName} tab`} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-espresso/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" onClick={onAddItem} className={`${adminBtnPrimary} w-full sm:w-auto`}>
              Add menu item
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={`${adminBtnSecondary} w-full sm:w-auto`}
            >
              {refreshing ? "Refreshing…" : "Refresh from sheet"}
            </button>
          </div>
          <p className="text-caption text-xs max-w-md sm:text-right leading-relaxed">
            Edited the sheet in Google? Refresh syncs this page, the public menu,
            and checkout.
          </p>
        </div>

        <div className="space-y-3 pt-1 border-t border-espresso/10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="w-full flex-1 min-w-0 max-w-xl">
              <span className="text-xs font-semibold text-espresso">
                Find items
              </span>
              <div className="relative mt-1.5">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search name, ID, category, allergens…"
                  className="w-full rounded-md border border-espresso/15 bg-cream/50 pl-3 pr-16 py-2 text-sm text-espresso placeholder:text-espresso/40 focus:outline-none focus:ring-2 focus:ring-sage-deep/30 focus:border-sage-deep/40"
                  aria-label="Search menu items"
                />
                {hasQuery ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-espresso/70 hover:bg-linen hover:text-espresso"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </label>
            <p
              className="text-xs text-espresso/70 tabular-nums shrink-0 pb-2"
              aria-live="polite"
            >
              {hasQuery ? (
                <>
                  <span className="font-semibold text-espresso">{matchCount}</span>
                  {" / "}
                  {totalCount} match
                  {matchCount === 1 ? "" : "es"}
                </>
              ) : (
                <span>{totalCount} items</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div
              className="flex w-full sm:w-auto rounded-md border border-espresso/15 overflow-hidden bg-cream/30"
              role="group"
              aria-label="Filter items"
            >
              {SCOPES.map(({ id, label }, index) => {
                const selected = searchScope === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onScopeChange(id)}
                    aria-pressed={selected}
                    className={`flex-1 min-h-[44px] px-3 py-2.5 text-sm font-semibold transition-colors touch-manipulation ${
                      index > 0 ? "border-l border-espresso/15" : ""
                    } ${
                      selected
                        ? "bg-espresso text-cream"
                        : "text-espresso hover:bg-linen/80"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={onCollapseAll}
                className="font-semibold text-espresso/75 hover:text-espresso underline-offset-2 hover:underline"
              >
                Collapse all
              </button>
              <span className="text-espresso/30" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={onExpandAll}
                className="font-semibold text-espresso/75 hover:text-espresso underline-offset-2 hover:underline"
              >
                Expand all
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

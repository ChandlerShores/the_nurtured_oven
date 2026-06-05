"use client"

import AdminCollapsibleFilters from "@/components/admin/ui/AdminCollapsibleFilters"
import { adminBtnPrimary, adminBtnSecondary } from "@/components/admin/ui/admin-button"
import MetricStrip from "@/components/admin/ui/MetricStrip"
import type { MenuSearchScope } from "@/lib/admin/menu-search"

const SCOPES: { id: MenuSearchScope; label: string; shortLabel: string }[] = [
  { id: "all", label: "All", shortLabel: "All" },
  { id: "active", label: "Live", shortLabel: "Live" },
  { id: "hidden", label: "Hidden", shortLabel: "Hidden" },
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
    <section className="space-y-5">
        <MetricStrip
          className="mb-1"
          metrics={[
            { label: "Live", value: activeCount },
            { label: "Featured", value: featuredName },
            { label: "Updated", value: lastRefreshedLabel },
            { label: "Sheet", value: tabName },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 sm:pt-6 border-t border-espresso/10">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="button" onClick={onAddItem} className={`${adminBtnPrimary} w-full sm:w-auto`}>
              Add item
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className={`${adminBtnSecondary} w-full sm:w-auto`}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <AdminCollapsibleFilters
          bordered={false}
          className="pt-1 border-t border-espresso/10"
          defaultOpen={hasQuery || searchScope !== "all"}
          hasActiveFilters={hasQuery || searchScope !== "all"}
          summary={
            hasQuery
              ? searchScope !== "all"
                ? `Search · ${SCOPES.find((s) => s.id === searchScope)?.label ?? searchScope}`
                : "Search"
              : searchScope !== "all"
                ? SCOPES.find((s) => s.id === searchScope)?.label
                : undefined
          }
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="w-full flex-1 min-w-0 max-w-xl">
              <span className="text-xs font-semibold text-espresso">
                Search
              </span>
              <div className="relative mt-1.5">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search…"
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
              className="grid grid-cols-3 w-full sm:w-auto sm:min-w-[min(100%,20rem)] rounded-lg border border-espresso/15 overflow-hidden bg-cream/30 shadow-sm"
              role="group"
              aria-label="Filter items"
            >
              {SCOPES.map(({ id, label, shortLabel }) => {
                const selected = searchScope === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onScopeChange(id)}
                    aria-pressed={selected}
                    aria-label={label}
                    title={label}
                    className={`min-h-[48px] px-2 sm:px-4 py-3 text-sm font-semibold transition-colors touch-manipulation whitespace-nowrap ${
                      id !== "all" ? "border-l border-espresso/15" : ""
                    } ${
                      selected
                        ? "bg-espresso text-cream"
                        : "text-espresso hover:bg-linen/80 active:bg-linen"
                    }`}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{shortLabel}</span>
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
                Collapse sections
              </button>
              <span className="text-espresso/30" aria-hidden>
                |
              </span>
              <button
                type="button"
                onClick={onExpandAll}
                className="font-semibold text-espresso/75 hover:text-espresso underline-offset-2 hover:underline"
              >
                Expand sections
              </button>
            </div>
          </div>
        </AdminCollapsibleFilters>
    </section>
  )
}

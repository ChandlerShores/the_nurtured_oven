"use client"

import DashboardCard from "@/components/admin/ui/DashboardCard"
import EmptyState from "@/components/admin/ui/EmptyState"
import { formatCentsDisplay } from "@/lib/admin/money"
import {
  expenseTotalsByCategory,
  maxTrendRevenue,
  moneyBreakdownSegments,
  shortWeekChartLabel,
  topProductsByRevenue,
  type MoneySegment,
} from "@/lib/admin/financial-chart-data"
import type {
  FinancialSummary,
  FinancialWeekTrendPoint,
  ProductProfitRow,
} from "@/lib/admin/financial-stats-types"
import type { FinancialExpenseRow } from "@/lib/admin/financial-stats-types"
import type { MoneySegmentId } from "@/lib/admin/financial-chart-data"

/** Inline fills — Tailwind cannot see dynamic class names from other files. */
const MONEY_SEGMENT_FILL: Record<MoneySegmentId, string> = {
  fees: "#E9E0D2",
  cogs: "#C89E9B",
  expenses: "#B8846E",
  profit: "#7D8A72",
}

export function FinancialHero({ summary }: { summary: FinancialSummary }) {
  const profitDisplay =
    summary.estimatedProfitCents != null
      ? formatCentsDisplay(summary.estimatedProfitCents)
      : null

  return (
    <section className="rounded-softer border border-sage/35 bg-gradient-to-br from-sage/20 via-warm-white to-linen/60 shadow-warm p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-xs uppercase tracking-wide text-olive/90">
            Estimated profit · {summary.batchLabel}
          </p>
          <p className="font-heading text-4xl sm:text-5xl text-charcoal mt-2 tabular-nums">
            {profitDisplay ?? "—"}
          </p>
          {!summary.hasProductCosts ? (
            <p className="text-sm text-olive/90 mt-2 max-w-md">
              Add product costs below to see profit. Until then, use gross revenue
              and the breakdown chart.
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 shrink-0">
          <div className="text-right sm:text-left">
            <p className="text-caption text-xs uppercase tracking-wide">Gross revenue</p>
            <p className="font-heading text-2xl text-charcoal tabular-nums mt-1">
              {formatCentsDisplay(summary.grossRevenueCents)}
            </p>
          </div>
          <div className="text-right sm:text-left">
            <p className="text-caption text-xs uppercase tracking-wide">Paid orders</p>
            <p className="font-heading text-2xl text-charcoal tabular-nums mt-1">
              {summary.paidOrderCount}
            </p>
            <p className="text-xs text-olive/80 mt-1">
              {formatCentsDisplay(summary.averageOrderValueCents)} avg
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FinancialDetailsStrip({ summary }: { summary: FinancialSummary }) {
  const items = [
    { label: "Net after Square", value: summary.estimatedNetRevenueCents },
    { label: "Square (est.)", value: summary.estimatedSquareFeesCents },
    { label: "Delivery fees", value: summary.deliveryRevenueCents },
    {
      label: "Product costs",
      value: summary.estimatedProductCostsCents,
    },
    { label: "Weekly expenses", value: summary.weeklyExpensesCents },
  ]

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-olive/90 px-1">
      {items.map((item) => (
        <span key={item.label}>
          <span className="text-caption">{item.label}</span>{" "}
          <span className="font-medium text-charcoal tabular-nums">
            {item.value != null && item.value > 0
              ? formatCentsDisplay(item.value)
              : item.value === 0
                ? "$0.00"
                : "—"}
          </span>
        </span>
      ))}
      <span className="text-caption text-xs w-full sm:w-auto">
        Square: 2.9% + $0.30/order · Labor $22/hr unless env overrides
      </span>
    </div>
  )
}

function StackedBar({
  segments,
  totalCents,
}: {
  segments: MoneySegment[]
  totalCents: number
}) {
  if (totalCents <= 0 || segments.length === 0) return null

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Stacked bar of how gross revenue is allocated"
    >
      <div className="relative h-12 sm:h-16 w-full rounded-soft overflow-hidden border border-oatmeal/50 bg-warm-white shadow-inner">
        <div className="absolute inset-0 flex flex-row">
          {segments.map((seg) => {
            const pct = (seg.cents / totalCents) * 100
            if (pct <= 0) return null
            return (
              <div
                key={seg.id}
                className="h-full shrink-0 transition-[width] duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: MONEY_SEGMENT_FILL[seg.id],
                  minWidth: pct < 1 ? "3px" : undefined,
                }}
                title={`${seg.label}: ${formatCentsDisplay(seg.cents)} (${Math.round(pct)}%)`}
              />
            )
          })}
        </div>
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] sm:text-xs text-caption px-0.5">
        <span>$0</span>
        <span>Gross {formatCentsDisplay(totalCents)}</span>
      </div>
    </div>
  )
}

export function MoneyFlowChart({ summary }: { summary: FinancialSummary }) {
  const segments = moneyBreakdownSegments(summary)
  const gross = summary.grossRevenueCents

  return (
    <DashboardCard
      title="Where the money went"
      subtitle="Share of gross revenue this bake week (estimated)"
    >
      {gross <= 0 ? (
        <EmptyState
          title="No revenue this week"
          message="Paid orders for this bake week will fill in the chart."
        />
      ) : (
        <>
          <StackedBar segments={segments} totalCents={gross} />
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            {segments.map((seg) => {
              const pct =
                gross > 0 ? Math.round((seg.cents / gross) * 100) : 0
              return (
                <li key={seg.id} className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-sm shrink-0 ring-1 ring-oatmeal/60"
                    style={{ backgroundColor: MONEY_SEGMENT_FILL[seg.id] }}
                  />
                  <span className="text-charcoal flex-1 min-w-0">
                    {seg.label}
                    <span className="text-caption text-xs ml-1">({pct}%)</span>
                  </span>
                  <span className="tabular-nums font-medium shrink-0">
                    {formatCentsDisplay(seg.cents)}
                  </span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </DashboardCard>
  )
}

export function WeekRevenueTrendChart({
  trend,
  activeWeekKey,
  onSelectWeek,
}: {
  trend: FinancialWeekTrendPoint[]
  activeWeekKey: string
  onSelectWeek?: (weekKey: string) => void
}) {
  const max = maxTrendRevenue(trend)

  return (
    <DashboardCard
      title="Revenue by bake week"
      subtitle="Gross from paid orders · click a bar to switch weeks"
    >
      {trend.length === 0 ? (
        <EmptyState title="No history yet" message="Trend appears as you take orders." />
      ) : (
        <div
          className="flex items-stretch gap-2 sm:gap-3 h-40 sm:h-48"
          role="img"
          aria-label="Bar chart of gross revenue by bake week"
        >
          {trend.map((point) => {
            const chartHeightPx = 112
            const barPx = Math.max(
              6,
              Math.round((point.grossRevenueCents / max) * chartHeightPx)
            )
            const active = point.weekKey === activeWeekKey
            const columnClass = `flex-1 flex flex-col items-center min-w-0 h-full ${
              onSelectWeek
                ? "cursor-pointer rounded-soft p-1 -m-1 hover:bg-linen/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-deep/40"
                : ""
            }`

            const bar = (
              <>
                <span className="text-xs font-medium tabular-nums text-charcoal/80 shrink-0 mb-1 min-h-[1.25rem]">
                  {point.grossRevenueCents > 0
                    ? formatCentsDisplay(point.grossRevenueCents)
                    : "\u00a0"}
                </span>
                <div
                  className="w-full flex-1 flex items-end justify-center min-h-0"
                  style={{ maxHeight: chartHeightPx }}
                >
                  <div
                    className={`w-full max-w-[3rem] rounded-t-soft transition-all ${
                      active
                        ? "bg-sage-deep shadow-gentle"
                        : "bg-sage/55 hover:bg-sage/75"
                    }`}
                    style={{ height: barPx }}
                  />
                </div>
                <span
                  className={`text-[10px] sm:text-xs text-center truncate w-full mt-2 shrink-0 ${
                    active ? "text-charcoal font-medium" : "text-caption"
                  }`}
                >
                  {shortWeekChartLabel(point.batchLabel)}
                </span>
              </>
            )

            if (onSelectWeek) {
              return (
                <button
                  key={point.weekKey}
                  type="button"
                  onClick={() => onSelectWeek(point.weekKey)}
                  className={columnClass}
                >
                  {bar}
                </button>
              )
            }

            return (
              <div key={point.weekKey} className={columnClass}>
                {bar}
              </div>
            )
          })}
        </div>
      )}
    </DashboardCard>
  )
}

function DonutChart({
  slices,
}: {
  slices: { label: string; cents: number; color: string }[]
}) {
  const total = slices.reduce((s, x) => s + x.cents, 0)
  if (total <= 0) return null

  let cursor = 0
  const stops = slices.map((slice) => {
    const pct = (slice.cents / total) * 100
    const start = cursor
    cursor += pct
    return `${slice.color} ${start}% ${cursor}%`
  })

  return (
    <div
      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full shrink-0 shadow-gentle ring-4 ring-warm-white"
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
      role="img"
      aria-label="Revenue by product chart"
    />
  )
}

const PRODUCT_SLICE_COLORS = [
  "#7D8A72",
  "#AEB5A0",
  "#C89E9B",
  "#B8846E",
  "#D0A55B",
  "#E9E0D2",
]

export function ProductMixChart({ rows }: { rows: ProductProfitRow[] }) {
  const top = topProductsByRevenue(rows)
  const total = top.reduce((s, r) => s + r.revenueCents, 0)
  const max = top[0]?.revenueCents ?? 1

  const donutSlices = top.map((row, i) => ({
    label: row.name,
    cents: row.revenueCents,
    color: PRODUCT_SLICE_COLORS[i % PRODUCT_SLICE_COLORS.length]!,
  }))

  return (
    <DashboardCard title="Sales mix" subtitle="Revenue by item this week">
      {top.length === 0 ? (
        <EmptyState title="No item sales" message="Line items show up on paid orders." />
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <DonutChart slices={donutSlices} />
          <ul className="flex-1 w-full space-y-3">
            {top.map((row, i) => {
              const width = Math.round((row.revenueCents / max) * 100)
              return (
                <li key={row.slug || row.name}>
                  <div className="flex justify-between text-sm gap-2 mb-1">
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            PRODUCT_SLICE_COLORS[i % PRODUCT_SLICE_COLORS.length],
                        }}
                      />
                      <span className="text-charcoal truncate">{row.name}</span>
                    </span>
                    <span className="tabular-nums font-medium shrink-0">
                      {formatCentsDisplay(row.revenueCents)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-linen overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sage-deep/60"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
      {total > 0 ? (
        <p className="text-caption text-xs mt-4">
          Top {top.length} items · {formatCentsDisplay(total)} shown
        </p>
      ) : null}
    </DashboardCard>
  )
}

export function ExpenseCategoryChart({
  expenses,
}: {
  expenses: FinancialExpenseRow[]
}) {
  const categories = expenseTotalsByCategory(expenses)
  const max = categories[0]?.cents ?? 1
  const total = categories.reduce((s, c) => s + c.cents, 0)

  return (
    <DashboardCard title="Expenses by category" subtitle="This bake week only">
      {categories.length === 0 ? (
        <EmptyState
          title="No expenses logged"
          message="Add costs in the form below to see the breakdown."
        />
      ) : (
        <>
          <p className="font-heading text-2xl text-charcoal tabular-nums mb-4">
            {formatCentsDisplay(total)}
          </p>
          <ul className="space-y-3">
            {categories.map((cat) => {
              const width = Math.round((cat.cents / max) * 100)
              return (
                <li key={cat.category}>
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="text-charcoal">{cat.category}</span>
                    <span className="tabular-nums font-medium">
                      {formatCentsDisplay(cat.cents)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-linen overflow-hidden">
                    <div
                      className="h-full rounded-full bg-terracotta/65"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </DashboardCard>
  )
}

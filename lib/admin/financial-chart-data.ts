import type {
  FinancialExpenseRow,
  FinancialSummary,
  FinancialWeekTrendPoint,
  ProductProfitRow,
} from "@/lib/admin/financial-stats-types"

export type MoneySegmentId = "fees" | "cogs" | "expenses" | "profit"

export interface MoneySegment {
  id: MoneySegmentId
  label: string
  cents: number
}

export function moneyBreakdownSegments(
  summary: FinancialSummary
): MoneySegment[] {
  const gross = summary.grossRevenueCents
  if (gross <= 0) return []

  const segments: MoneySegment[] = [
    {
      id: "fees",
      label: "Square (est.)",
      cents: summary.estimatedSquareFeesCents,
    },
  ]

  if (summary.estimatedProductCostsCents != null && summary.estimatedProductCostsCents > 0) {
    segments.push({
      id: "cogs",
      label: "Product costs (est.)",
      cents: summary.estimatedProductCostsCents,
    })
  }

  if (summary.weeklyExpensesCents > 0) {
    segments.push({
      id: "expenses",
      label: "Weekly expenses",
      cents: summary.weeklyExpensesCents,
    })
  }

  const cogs = summary.estimatedProductCostsCents ?? 0
  const expenses = summary.weeklyExpensesCents
  const fees = summary.estimatedSquareFeesCents

  // Remainder of gross so bar slices always sum to 100% of revenue
  const profit = Math.max(0, gross - fees - cogs - expenses)

  if (profit > 0) {
    segments.push({
      id: "profit",
      label: summary.hasProductCosts ? "Est. profit" : "Left after costs",
      cents: profit,
    })
  }

  return segments.filter((s) => s.cents > 0)
}

export function expenseTotalsByCategory(
  expenses: FinancialExpenseRow[]
): { category: string; cents: number }[] {
  const map = new Map<string, number>()
  for (const row of expenses) {
    const key = row.category.trim() || "Uncategorized"
    map.set(key, (map.get(key) ?? 0) + row.amountCents)
  }
  return Array.from(map.entries())
    .map(([category, cents]) => ({ category, cents }))
    .sort((a, b) => b.cents - a.cents)
}

export function shortWeekChartLabel(batchLabel: string): string {
  const match = batchLabel.match(/(\d{1,2})\/(\d{1,2})/)
  if (match) return `${match[1]}/${match[2]}`
  return batchLabel.replace(/^Friday\s*/i, "").slice(0, 8)
}

export function maxTrendRevenue(trend: FinancialWeekTrendPoint[]): number {
  return Math.max(1, ...trend.map((t) => t.grossRevenueCents))
}

export function topProductsByRevenue(
  rows: ProductProfitRow[],
  limit = 6
): ProductProfitRow[] {
  return [...rows].sort((a, b) => b.revenueCents - a.revenueCents).slice(0, limit)
}

import { parseMoneyToCents } from "@/lib/admin/money"
import type {
  FinancialDashboardData,
  FinancialWeekSnapshot,
  FinancialWeekTrendPoint,
  FulfillmentWeekOption,
  ProductProfitRow,
} from "@/lib/admin/financial-stats-types"
import type { ProductCostRow } from "@/lib/google-sheets/product-costs"
import type { WeeklyExpenseRow } from "@/lib/google-sheets/weekly-expenses"
import {
  matchesFulfillmentWeek,
  type AdminOrderLineRow,
  type AdminOrderRow,
} from "@/lib/google-sheets/orders"
import {
  formatBatchLabel,
  getWeeklyFulfillmentContext,
} from "@/lib/order/weekly-fulfillment"

const EXCLUDED_REVENUE_STATUSES = new Set(["Refunded", "Cancelled"])

/** Default Square estimate: 2.9% + $0.30 per paid order. */
const DEFAULT_SQUARE_FEE_BPS = 290
const DEFAULT_SQUARE_FEE_FIXED_CENTS = 30

/** Default $22/hr labor for cost estimates when Product Costs has labor minutes. */
const DEFAULT_LABOR_CENTS_PER_MINUTE = Math.round((22 * 100) / 60)

export type {
  FinancialDashboardData,
  FinancialSummary,
  FinancialWeekSnapshot,
  FinancialWeekTrendPoint,
  FulfillmentWeekOption,
  ProductProfitRow,
} from "@/lib/admin/financial-stats-types"

function isPaidPayment(order: AdminOrderRow): boolean {
  const status = order.paymentStatus.trim().toLowerCase()
  return status === "paid" || status === "completed"
}

function countsForRevenue(order: AdminOrderRow): boolean {
  if (!isPaidPayment(order)) return false
  const status = order.orderStatus.trim()
  return !EXCLUDED_REVENUE_STATUSES.has(status)
}

function isDeliveryLine(line: AdminOrderLineRow): boolean {
  const slug = line.slug.trim().toLowerCase()
  if (slug.includes("delivery")) return true
  const name = line.name.trim().toLowerCase()
  return name.includes("delivery")
}

function squareFeeConfig(): { bps: number; fixedCents: number } {
  const bps = Number(process.env.FINANCIAL_SQUARE_FEE_BPS)
  const fixed = Number(process.env.FINANCIAL_SQUARE_FEE_FIXED_CENTS)
  return {
    bps: Number.isFinite(bps) && bps >= 0 ? bps : DEFAULT_SQUARE_FEE_BPS,
    fixedCents:
      Number.isFinite(fixed) && fixed >= 0
        ? fixed
        : DEFAULT_SQUARE_FEE_FIXED_CENTS,
  }
}

function laborCentsPerMinute(): number {
  const hourly = Number(process.env.FINANCIAL_LABOR_RATE_PER_HOUR)
  if (Number.isFinite(hourly) && hourly > 0) {
    return Math.round((hourly * 100) / 60)
  }
  return DEFAULT_LABOR_CENTS_PER_MINUTE
}

function unitCostCents(cost: ProductCostRow): number {
  const labor =
    Math.round(cost.laborMinutesPerUnit * laborCentsPerMinute())
  return (
    cost.ingredientCostPerUnitCents +
    cost.packagingCostPerUnitCents +
    labor
  )
}

function weekMetaFromLabel(label: string): {
  fulfillmentDate: string
  batchLabel: string
} {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const parts = label.split("-").map(Number)
    return {
      fulfillmentDate: label,
      batchLabel: formatBatchLabel(parts[0], parts[1], parts[2]),
    }
  }
  return { fulfillmentDate: label, batchLabel: label }
}

function orderInSelectedWeek(
  fulfillmentLabel: string,
  week: FulfillmentWeekOption
): boolean {
  const label = fulfillmentLabel.trim()
  if (!label) return false
  if (label === week.weekKey) return true
  return matchesFulfillmentWeek(
    label,
    week.fulfillmentDate,
    week.batchLabel
  )
}

export function listFulfillmentWeekOptions(
  orders: AdminOrderRow[]
): FulfillmentWeekOption[] {
  const map = new Map<string, FulfillmentWeekOption>()

  for (const order of orders) {
    if (!countsForRevenue(order)) continue
    const weekKey = order.fulfillmentLabel.trim()
    if (!weekKey) continue

    const { fulfillmentDate, batchLabel } = weekMetaFromLabel(weekKey)
    const existing = map.get(weekKey)
    if (existing) {
      existing.paidOrderCount += 1
    } else {
      map.set(weekKey, {
        weekKey,
        fulfillmentDate,
        batchLabel,
        paidOrderCount: 1,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    b.weekKey.localeCompare(a.weekKey)
  )
}

export function buildFinancialDashboard(
  orders: AdminOrderRow[],
  lineItems: AdminOrderLineRow[],
  productCosts: ProductCostRow[],
  expenses: WeeklyExpenseRow[],
  weekKey?: string
): FinancialDashboardData {
  const ctx = getWeeklyFulfillmentContext()
  const weekOptions = listFulfillmentWeekOptions(orders)

  const selected =
    weekOptions.find((w) => w.weekKey === weekKey) ??
    weekOptions.find((w) =>
      matchesFulfillmentWeek(
        w.weekKey,
        ctx.fulfillmentDate,
        ctx.batchLabel
      )
    ) ??
    weekOptions[0] ?? {
      weekKey: ctx.batchLabel,
      fulfillmentDate: ctx.fulfillmentDate,
      batchLabel: ctx.batchLabel,
      paidOrderCount: 0,
    }

  const revenueOrders = orders.filter(
    (o) => countsForRevenue(o) && orderInSelectedWeek(o.fulfillmentLabel, selected)
  )

  const revenueRefs = new Set(revenueOrders.map((o) => o.internalRef))

  const weekLines = lineItems.filter(
    (line) =>
      revenueRefs.has(line.internalRef) &&
      orderInSelectedWeek(line.fulfillmentLabel, selected)
  )

  let grossRevenueCents = 0
  let deliveryRevenueCents = 0
  const { bps, fixedCents } = squareFeeConfig()
  let estimatedSquareFeesCents = 0

  for (const order of revenueOrders) {
    const amount = parseMoneyToCents(order.amount)
    grossRevenueCents += amount
    estimatedSquareFeesCents +=
      Math.round((amount * bps) / 10000) + fixedCents
  }

  for (const line of weekLines) {
    if (!isDeliveryLine(line)) continue
    const lineTotal =
      line.lineTotalCents > 0
        ? line.lineTotalCents
        : line.unitPriceCents * line.quantity
    deliveryRevenueCents += lineTotal
  }

  const paidOrderCount = revenueOrders.length
  const averageOrderValueCents =
    paidOrderCount > 0 ? Math.round(grossRevenueCents / paidOrderCount) : 0

  const estimatedNetRevenueCents =
    grossRevenueCents - estimatedSquareFeesCents

  const costBySlug = new Map(
    productCosts
      .filter((c) => c.active)
      .map((c) => [c.slug.trim().toLowerCase(), c])
  )
  const hasProductCosts = costBySlug.size > 0

  const productMap = new Map<
    string,
    {
      slug: string
      name: string
      units: number
      revenueCents: number
      costCents: number
    }
  >()

  for (const line of weekLines) {
    if (isDeliveryLine(line)) continue

    const slugKey = line.slug.trim().toLowerCase() || line.name.trim().toLowerCase()
    const name = line.name.trim() || line.slug.trim() || "Item"
    const lineRevenue =
      line.lineTotalCents > 0
        ? line.lineTotalCents
        : line.unitPriceCents * line.quantity

    const existing = productMap.get(slugKey) ?? {
      slug: line.slug.trim(),
      name,
      units: 0,
      revenueCents: 0,
      costCents: 0,
    }
    existing.units += line.quantity
    existing.revenueCents += lineRevenue

    const costRow = line.slug ? costBySlug.get(line.slug.trim().toLowerCase()) : undefined
    if (costRow) {
      existing.costCents += unitCostCents(costRow) * line.quantity
    }

    productMap.set(slugKey, existing)
  }

  const productProfit: ProductProfitRow[] = Array.from(productMap.values())
    .map((p) => {
      const profit = p.revenueCents - p.costCents
      const margin =
        p.revenueCents > 0 && hasProductCosts
          ? (profit / p.revenueCents) * 100
          : null
      return {
        slug: p.slug,
        name: p.name,
        unitsSold: p.units,
        revenueCents: p.revenueCents,
        estimatedCostCents: p.costCents,
        estimatedProfitCents: profit,
        marginPercent: margin,
      }
    })
    .sort((a, b) => b.revenueCents - a.revenueCents)

  const estimatedProductCostsCents = hasProductCosts
    ? productProfit.reduce((sum, p) => sum + p.estimatedCostCents, 0)
    : null

  const weekExpenses = expenses.filter((e) =>
    orderInSelectedWeek(e.fulfillmentDate, selected)
  )
  const weeklyExpensesCents = weekExpenses.reduce(
    (sum, e) => sum + e.amountCents,
    0
  )

  const estimatedProfitCents =
    hasProductCosts && estimatedProductCostsCents != null
      ? estimatedNetRevenueCents -
        estimatedProductCostsCents -
        weeklyExpensesCents
      : null

  return {
    selectedWeek: selected,
    weekOptions,
    summary: {
      fulfillmentDate: selected.fulfillmentDate,
      batchLabel: selected.batchLabel,
      grossRevenueCents,
      paidOrderCount,
      averageOrderValueCents,
      deliveryRevenueCents,
      estimatedSquareFeesCents,
      estimatedNetRevenueCents,
      estimatedProductCostsCents,
      weeklyExpensesCents,
      estimatedProfitCents,
      hasProductCosts,
    },
    productProfit,
    expenses: weekExpenses.sort((a, b) =>
      b.expenseDate.localeCompare(a.expenseDate)
    ),
    productCosts,
  }
}

/** All bake weeks in one payload — avoids refetch when switching weeks in the UI. */
export function buildFinancialDashboardPayload(
  orders: AdminOrderRow[],
  lineItems: AdminOrderLineRow[],
  productCosts: ProductCostRow[],
  expenses: WeeklyExpenseRow[],
  weekKey?: string
): FinancialDashboardData {
  const weekOptions = listFulfillmentWeekOptions(orders)
  const ctx = getWeeklyFulfillmentContext()
  const weekSnapshots: Record<string, FinancialWeekSnapshot> = {}
  const weekTrend: FinancialWeekTrendPoint[] = []

  for (const w of weekOptions) {
    const dash = buildFinancialDashboard(
      orders,
      lineItems,
      productCosts,
      expenses,
      w.weekKey
    )
    weekSnapshots[w.weekKey] = {
      selectedWeek: dash.selectedWeek,
      summary: dash.summary,
      productProfit: dash.productProfit,
      expenses: dash.expenses,
    }
    weekTrend.push({
      weekKey: w.weekKey,
      batchLabel: w.batchLabel,
      grossRevenueCents: dash.summary.grossRevenueCents,
      estimatedProfitCents: dash.summary.estimatedProfitCents,
      paidOrderCount: dash.summary.paidOrderCount,
    })
  }

  const defaultKey =
    (weekKey && weekSnapshots[weekKey] ? weekKey : null) ??
    weekOptions.find((w) =>
      matchesFulfillmentWeek(w.weekKey, ctx.fulfillmentDate, ctx.batchLabel)
    )?.weekKey ??
    weekOptions[0]?.weekKey ??
    ctx.batchLabel

  return {
    weekOptions,
    initialWeekKey: defaultKey,
    weekSnapshots,
    weekTrend,
    productCosts,
  }
}

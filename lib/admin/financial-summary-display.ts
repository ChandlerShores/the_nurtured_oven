import { formatCentsDisplay } from "@/lib/admin/money"
import type { FinancialSummary } from "@/lib/admin/financial-stats-types"

export function summaryDisplayCards(summary: FinancialSummary) {
  return {
    grossRevenue: formatCentsDisplay(summary.grossRevenueCents),
    paidOrders: String(summary.paidOrderCount),
    averageOrder: formatCentsDisplay(summary.averageOrderValueCents),
    deliveryRevenue: formatCentsDisplay(summary.deliveryRevenueCents),
    squareFees: formatCentsDisplay(summary.estimatedSquareFeesCents),
    netRevenue: formatCentsDisplay(summary.estimatedNetRevenueCents),
    productCosts:
      summary.estimatedProductCostsCents != null
        ? formatCentsDisplay(summary.estimatedProductCostsCents)
        : null,
    weeklyExpenses: formatCentsDisplay(summary.weeklyExpensesCents),
    profit:
      summary.estimatedProfitCents != null
        ? formatCentsDisplay(summary.estimatedProfitCents)
        : null,
  }
}

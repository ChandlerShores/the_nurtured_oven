export interface FulfillmentWeekOption {
  weekKey: string
  fulfillmentDate: string
  batchLabel: string
  paidOrderCount: number
}

export interface ProductProfitRow {
  slug: string
  name: string
  unitsSold: number
  revenueCents: number
  estimatedCostCents: number
  estimatedProfitCents: number
  marginPercent: number | null
}

export interface FinancialSummary {
  fulfillmentDate: string
  batchLabel: string
  grossRevenueCents: number
  paidOrderCount: number
  averageOrderValueCents: number
  deliveryRevenueCents: number
  estimatedSquareFeesCents: number
  estimatedNetRevenueCents: number
  estimatedProductCostsCents: number | null
  weeklyExpensesCents: number
  estimatedProfitCents: number | null
  hasProductCosts: boolean
}

export interface FinancialExpenseRow {
  sheetRow: number
  expenseTimestamp: string
  expenseDate: string
  fulfillmentDate: string
  category: string
  vendor: string
  description: string
  amountCents: number
  paymentMethod: string
  notes: string
}

export interface FinancialProductCostRow {
  sheetRow: number
  slug: string
  name: string
  ingredientCostPerUnitCents: number
  packagingCostPerUnitCents: number
  laborMinutesPerUnit: number
  active: boolean
  notes: string
}

export interface FinancialWeekTrendPoint {
  weekKey: string
  batchLabel: string
  grossRevenueCents: number
  estimatedProfitCents: number | null
  paidOrderCount: number
}

export interface FinancialWeekSnapshot {
  selectedWeek: FulfillmentWeekOption
  summary: FinancialSummary
  productProfit: ProductProfitRow[]
  expenses: FinancialExpenseRow[]
}

export interface FinancialDashboardData {
  weekOptions: FulfillmentWeekOption[]
  initialWeekKey: string
  weekSnapshots: Record<string, FinancialWeekSnapshot>
  weekTrend: FinancialWeekTrendPoint[]
  productCosts: FinancialProductCostRow[]
}

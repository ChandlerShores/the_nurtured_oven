const DEFAULT_SQUARE_FEE_BPS = 290
const DEFAULT_SQUARE_FEE_FIXED_CENTS = 30
const DEFAULT_LABOR_HOURLY = 22

export function financialLaborRateLabel(): string {
  const hourly = Number(process.env.FINANCIAL_LABOR_RATE_PER_HOUR)
  if (Number.isFinite(hourly) && hourly > 0) {
    return `$${hourly}/hr`
  }
  return `$${DEFAULT_LABOR_HOURLY}/hr`
}

export function financialSquareFeeLabel(): string {
  const bps = Number(process.env.FINANCIAL_SQUARE_FEE_BPS)
  const fixed = Number(process.env.FINANCIAL_SQUARE_FEE_FIXED_CENTS)
  const useBps =
    Number.isFinite(bps) && bps >= 0 ? bps : DEFAULT_SQUARE_FEE_BPS
  const useFixed =
    Number.isFinite(fixed) && fixed >= 0
      ? fixed
      : DEFAULT_SQUARE_FEE_FIXED_CENTS
  const pct = (useBps / 100).toFixed(2)
  const dollars = (useFixed / 100).toFixed(2)
  return `${pct}% + $${dollars}/order`
}

export function buildFinancialEstimateNotes() {
  return {
    laborRateLabel: financialLaborRateLabel(),
    squareFeeLabel: financialSquareFeeLabel(),
  }
}

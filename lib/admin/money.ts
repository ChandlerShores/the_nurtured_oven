export function parseMoneyToCents(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "").trim()
  if (!cleaned) return 0
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return 0
  if (cleaned.includes(".") || n < 500) return Math.round(n * 100)
  return Math.round(n)
}

/** Dollar string for goal form inputs (no $ prefix). */
export function dollarsFromCents(cents: number | null): string {
  if (cents == null || cents <= 0) return ""
  return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)
}

export function formatCentsDisplay(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return "$0"
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`
}

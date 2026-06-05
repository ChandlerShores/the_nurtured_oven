import {
  addCalendarDays,
  formatBatchLabel,
  formatYmd,
} from "@/lib/order/weekly-fulfillment"

/** Match a sheet fulfillment label to a bake week (ISO date or batch label). */
export function matchesFulfillmentWeek(
  fulfillmentLabel: string,
  fulfillmentDate: string,
  batchLabel: string
): boolean {
  const label = fulfillmentLabel.trim()
  if (!label) return false
  if (label === fulfillmentDate || label === batchLabel) return true
  if (label.includes(fulfillmentDate)) return true

  const fridayParts = fulfillmentDate.split("-").map(Number)
  if (fridayParts.length === 3) {
    const [, month, day] = fridayParts
    const short = formatBatchLabel(fridayParts[0], month, day)
    if (label === short || label.includes(`${month}/${day}`)) return true
  }

  return false
}

export function weekMetaFromLabel(label: string): {
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

export function fulfillmentDateFromWeekKey(weekKey: string): string {
  return weekMetaFromLabel(weekKey.trim()).fulfillmentDate
}

export function fulfillmentWeekKeysMatch(a: string, b: string): boolean {
  const left = a.trim()
  const right = b.trim()
  if (!left || !right) return false
  if (left === right) return true

  const metaA = weekMetaFromLabel(left)
  const metaB = weekMetaFromLabel(right)
  if (metaA.fulfillmentDate === metaB.fulfillmentDate) return true

  return (
    matchesFulfillmentWeek(left, metaB.fulfillmentDate, metaB.batchLabel) ||
    matchesFulfillmentWeek(right, metaA.fulfillmentDate, metaA.batchLabel)
  )
}

export function isViewingPriorBakeWeek(
  activeWeekKey: string,
  operationalWeekKey: string
): boolean {
  if (fulfillmentWeekKeysMatch(activeWeekKey, operationalWeekKey)) {
    return false
  }
  const activeDate = fulfillmentDateFromWeekKey(activeWeekKey)
  const operationalDate = fulfillmentDateFromWeekKey(operationalWeekKey)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(activeDate)) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(operationalDate)) return false
  return activeDate < operationalDate
}

export function previousFulfillmentDate(fulfillmentDate: string): string {
  const parts = fulfillmentDate.split("-").map(Number)
  if (parts.length !== 3) return fulfillmentDate
  const prev = addCalendarDays(parts[0], parts[1], parts[2], -7)
  return formatYmd(prev.year, prev.month, prev.day)
}

import { formatDeliveryLine } from "@/lib/content/fulfillment"
import { formatBatchLabelShort } from "@/lib/order/weekly-fulfillment"
import type { WeeklyFulfillmentContext } from "@/lib/order/weekly-fulfillment"

export const SQUARE_PAYMENT_NOTE_MAX_LENGTH = 500

export interface PaymentNoteInput {
  name: string
  phone?: string
  fulfillment: "pickup" | "delivery"
  deliveryCity?: string
  deliveryAddress?: string
  dietary?: string
  message?: string
  batch: Pick<WeeklyFulfillmentContext, "fulfillmentDate" | "internalRef">
}

export interface ParsedPaymentNote {
  batchShort?: string
  fulfillmentMethod?: "pickup" | "delivery"
  customerName?: string
  phone?: string
  deliveryLine?: string
  dietary?: string
  message?: string
  internalRef?: string
}

const SEGMENT_SEPARATOR = " | "

function truncateField(value: string, max: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

function emptyToDash(value?: string): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "-"
}

function formatDietary(value?: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return "Dietary: -"
  return `Dietary: ${truncateField(trimmed, 60)}`
}

function formatMessage(value?: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return "Msg: -"
  return `Msg: ${truncateField(trimmed, 60)}`
}

function fulfillmentFridayParts(fulfillmentDate: string): {
  year: number
  month: number
  day: number
} {
  const [year, month, day] = fulfillmentDate.split("-").map(Number)
  return { year, month, day }
}

/** Compact Square payment note (max 500 chars). Sensitive details stay out of metadata. */
export function buildPaymentNote(input: PaymentNoteInput): string {
  const { year, month, day } = fulfillmentFridayParts(input.batch.fulfillmentDate)
  const method = input.fulfillment === "delivery" ? "DELIVERY" : "PICKUP"
  const deliveryLine =
    input.fulfillment === "delivery"
      ? truncateField(
          formatDeliveryLine(input.deliveryCity, input.deliveryAddress) ?? "-",
          80
        )
      : "-"

  const segments = [
    `TNO ${formatBatchLabelShort(year, month, day)}`,
    method,
    truncateField(input.name, 40),
    emptyToDash(input.phone ? truncateField(input.phone, 20) : undefined),
    deliveryLine,
    formatDietary(input.dietary),
    formatMessage(input.message),
    `Ref: ${input.batch.internalRef}`,
  ]

  const note = segments.join(SEGMENT_SEPARATOR)
  if (note.length <= SQUARE_PAYMENT_NOTE_MAX_LENGTH) return note

  const refSegment = segments[segments.length - 1]!
  const maxBody = SQUARE_PAYMENT_NOTE_MAX_LENGTH - refSegment.length - SEGMENT_SEPARATOR.length
  const body = segments.slice(0, -1).join(SEGMENT_SEPARATOR)
  return `${body.slice(0, maxBody)}${SEGMENT_SEPARATOR}${refSegment}`
}

export function parsePaymentNote(note?: string): ParsedPaymentNote {
  if (!note?.trim()) return {}

  const segments = note.split(SEGMENT_SEPARATOR).map((s) => s.trim())
  const parsed: ParsedPaymentNote = {}

  if (segments[0]?.startsWith("TNO ")) {
    parsed.batchShort = segments[0].replace(/^TNO\s+/, "")
  }

  const method = segments[1]?.toUpperCase()
  if (method === "PICKUP" || method === "DELIVERY") {
    parsed.fulfillmentMethod = method.toLowerCase() as "pickup" | "delivery"
  }

  if (segments[2] && segments[2] !== "-") parsed.customerName = segments[2]
  if (segments[3] && segments[3] !== "-") parsed.phone = segments[3]

  if (segments[4] && segments[4] !== "-") parsed.deliveryLine = segments[4]

  const dietarySeg = segments[5]
  if (dietarySeg?.startsWith("Dietary:")) {
    const value = dietarySeg.replace(/^Dietary:\s*/, "").trim()
    if (value && value !== "-") parsed.dietary = value
  }

  const msgSeg = segments[6]
  if (msgSeg?.startsWith("Msg:")) {
    const value = msgSeg.replace(/^Msg:\s*/, "").trim()
    if (value && value !== "-") parsed.message = value
  }

  const refSeg = segments[7] ?? segments.find((s) => s.startsWith("Ref:"))
  if (refSeg?.startsWith("Ref:")) {
    parsed.internalRef = refSeg.replace(/^Ref:\s*/, "").trim()
  }

  return parsed
}

import { NextResponse } from "next/server"
import { parseMoneyToCents } from "@/lib/admin/money"
import { isInternalRef } from "@/lib/order/internal-ref"
import { clampString } from "@/lib/security/public-input"

export const ADMIN_JSON_MAX_BYTES = 48_000

export async function readAdminJsonBody(
  request: Request
): Promise<
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: NextResponse }
> {
  const raw = await request.text()
  if (!raw.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
    }
  }
  if (raw.length > ADMIN_JSON_MAX_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request too large." }, { status: 413 }),
    }
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
      }
    }
    return { ok: true, body: parsed as Record<string, unknown> }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
    }
  }
}

export function parseAdminInternalRef(value: unknown): string | null {
  const ref = clampString(value, 48)
  if (!ref || !isInternalRef(ref)) return null
  return ref
}

export function parseAdminSheetRow(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n) || n < 2 || n > 50_000) return undefined
  return Math.floor(n)
}

export function parseAdminMoneyAmount(value: unknown): {
  ok: boolean
  cents?: number
  display?: string
  error?: string
} {
  const raw = clampString(value, 24)
  if (!raw) {
    return { ok: false, error: "Amount is required." }
  }
  const cents = parseMoneyToCents(raw)
  if (cents <= 0) {
    return { ok: false, error: "Enter a positive amount." }
  }
  if (cents > 10_000_000) {
    return { ok: false, error: "Amount is too large." }
  }
  return { ok: true, cents, display: raw }
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function parseAdminDateField(
  value: unknown,
  label: string
): { ok: true; value: string } | { ok: false; error: string } {
  const raw = clampString(value, 32)
  if (!raw) {
    return { ok: false, error: `${label} is required.` }
  }
  if (ISO_DATE_RE.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number)
    const dt = new Date(y!, m! - 1, d)
    if (
      dt.getFullYear() !== y ||
      dt.getMonth() !== m! - 1 ||
      dt.getDate() !== d
    ) {
      return { ok: false, error: `${label} is not a valid date.` }
    }
    return { ok: true, value: raw }
  }
  if (raw.length <= 64) {
    return { ok: true, value: raw }
  }
  return { ok: false, error: `${label} is too long.` }
}

export interface AdminExpenseInput {
  expenseDate: string
  fulfillmentDate: string
  category: string
  vendor: string
  description: string
  amount: string
  paymentMethod: string
  notes: string
}

export function parseAdminExpenseBody(
  body: Record<string, unknown>
): { ok: true; expense: AdminExpenseInput } | { ok: false; error: string } {
  const expenseDate = parseAdminDateField(body.expenseDate, "Expense date")
  if (!expenseDate.ok) return expenseDate

  const fulfillmentDate = parseAdminDateField(
    body.fulfillmentDate,
    "Bake week"
  )
  if (!fulfillmentDate.ok) return fulfillmentDate

  const category = clampString(body.category, 64)
  if (!category) {
    return { ok: false, error: "Category is required." }
  }

  const amount = parseAdminMoneyAmount(body.amount)
  if (!amount.ok) {
    return { ok: false, error: amount.error ?? "Invalid amount." }
  }

  return {
    ok: true,
    expense: {
      expenseDate: expenseDate.value,
      fulfillmentDate: fulfillmentDate.value,
      category,
      vendor: clampString(body.vendor, 80),
      description: clampString(body.description, 200),
      amount: amount.display!,
      paymentMethod: clampString(body.paymentMethod, 48),
      notes: clampString(body.notes, 500),
    },
  }
}

export interface AdminProductCostRowInput {
  sheetRow?: number
  slug: string
  name: string
  ingredientCostPerUnit: string
  packagingCostPerUnit: string
  laborMinutesPerUnit: number
  active: boolean
  notes: string
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parseAdminProductCostRow(
  value: unknown,
  index: number
): { ok: true; row: AdminProductCostRowInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: `Row ${index + 1} is invalid.` }
  }
  const raw = value as Record<string, unknown>
  const slug = clampString(raw.slug, 64).toLowerCase()
  if (!slug || !SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: `Row ${index + 1}: slug must be lowercase letters, numbers, and hyphens.`,
    }
  }

  const labor = Number(raw.laborMinutesPerUnit)
  const laborMinutes =
    Number.isFinite(labor) && labor >= 0 ? Math.min(labor, 24 * 60) : 0

  return {
    ok: true,
    row: {
      sheetRow: parseAdminSheetRow(raw.sheetRow),
      slug,
      name: clampString(raw.name, 120) || slug,
      ingredientCostPerUnit: clampString(raw.ingredientCostPerUnit, 16),
      packagingCostPerUnit: clampString(raw.packagingCostPerUnit, 16),
      laborMinutesPerUnit: laborMinutes,
      active: raw.active !== false,
      notes: clampString(raw.notes, 500),
    },
  }
}

export function parseAdminProductCostsPatch(
  body: Record<string, unknown>
):
  | { ok: true; costs: AdminProductCostRowInput[] }
  | { ok: false; error: string } {
  const costs = body.costs
  if (!Array.isArray(costs) || costs.length === 0) {
    return { ok: false, error: "No costs to save." }
  }
  if (costs.length > 200) {
    return { ok: false, error: "Too many rows in one save (max 200)." }
  }

  const parsed: AdminProductCostRowInput[] = []
  for (let i = 0; i < costs.length; i++) {
    const row = parseAdminProductCostRow(costs[i], i)
    if (!row.ok) return row
    parsed.push(row.row)
  }
  return { ok: true, costs: parsed }
}

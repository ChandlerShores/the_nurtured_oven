import "server-only"

import { parseMoneyToCents } from "@/lib/admin/money"
import { getSheetsClient, sheetTabFromRange } from "@/lib/google-sheets/client"

export interface ProductCostRow {
  sheetRow: number
  slug: string
  name: string
  ingredientCostPerUnitCents: number
  packagingCostPerUnitCents: number
  laborMinutesPerUnit: number
  active: boolean
  notes: string
}

function parseBool(value: string): boolean {
  const v = value.trim().toLowerCase()
  return v === "true" || v === "yes" || v === "1"
}

function parseProductCostRows(values: string[][]): ProductCostRow[] {
  const rows: ProductCostRow[] = []
  for (let i = 0; i < values.length; i++) {
    const row = values[i]
    if (!row?.length) continue
    const slug = (row[0] ?? "").trim()
    if (!slug) continue
    const labor = Number(row[4])
    rows.push({
      sheetRow: i + 2,
      slug,
      name: (row[1] ?? "").trim(),
      ingredientCostPerUnitCents: parseMoneyToCents(row[2] ?? ""),
      packagingCostPerUnitCents: parseMoneyToCents(row[3] ?? ""),
      laborMinutesPerUnit: Number.isFinite(labor) && labor >= 0 ? labor : 0,
      active: parseBool(row[5] ?? "true"),
      notes: (row[6] ?? "").trim(),
    })
  }
  return rows
}

export async function fetchProductCostsFromSheet(): Promise<ProductCostRow[]> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const tab = sheetTabFromRange(client.productCostsRange)
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A2:G`,
  })

  return parseProductCostRows((res.data.values as string[][]) ?? [])
}

export interface ProductCostUpdate {
  slug: string
  name: string
  ingredientCostPerUnit: string
  packagingCostPerUnit: string
  laborMinutesPerUnit: number
  active: boolean
  notes: string
}

export function resolveProductCostSheetRow(
  existing: ProductCostRow[],
  slug: string,
  sheetRow?: number
): number | undefined {
  if (sheetRow && sheetRow >= 2) return sheetRow
  const key = slug.trim().toLowerCase()
  if (!key) return undefined
  const match = existing.find((c) => c.slug.trim().toLowerCase() === key)
  return match && match.sheetRow >= 2 ? match.sheetRow : undefined
}

function formatMoneyForSheet(cents: number): string {
  if (cents <= 0) return ""
  return (cents / 100).toFixed(2)
}

export async function upsertProductCostRow(
  update: ProductCostUpdate,
  sheetRow?: number
): Promise<number> {
  const client = getSheetsClient()
  if (!client) throw new Error("Google Sheets is not configured.")

  const tab = sheetTabFromRange(client.productCostsRange)
  const values = [
    update.slug.trim(),
    update.name.trim(),
    formatMoneyForSheet(parseMoneyToCents(update.ingredientCostPerUnit)),
    formatMoneyForSheet(parseMoneyToCents(update.packagingCostPerUnit)),
    update.laborMinutesPerUnit,
    update.active ? "TRUE" : "FALSE",
    update.notes.trim(),
  ]

  if (sheetRow && sheetRow >= 2) {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId: client.spreadsheetId,
      range: `${tab}!A${sheetRow}:G${sheetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    })
    return sheetRow
  }

  const res = await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: client.productCostsRange,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  })

  const updatedRange = res.data.updates?.updatedRange ?? ""
  const match = updatedRange.match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

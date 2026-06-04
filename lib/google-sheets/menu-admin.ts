import "server-only"

import { getSheetsClient, sheetTabFromRange } from "@/lib/google-sheets/client"
import {
  formatBooleanForSheet,
  menuRowToSheetValues,
  parseMenuSheetRows,
  type MenuSheetRow,
} from "@/lib/google-sheets/menu-parse"
import { DEFAULT_MENU_RANGE } from "@/lib/google-sheets/menu"

export interface MenuSheetRowWithIndex extends MenuSheetRow {
  /** 1-based row number in the Menu tab (includes header). */
  sheetRow: number
}

function parseEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function getMenuRangeConfig(): { menuRange: string; tab: string } {
  const menuRange =
    parseEnv("GOOGLE_SHEETS_MENU_RANGE") ?? DEFAULT_MENU_RANGE
  const tab = sheetTabFromRange(menuRange)
  return { menuRange, tab }
}

const MENU_LAST_COL = "M"

function dataRange(menuRange: string, tab: string): string {
  return menuRange.includes("!") ? menuRange : `${tab}!A:${MENU_LAST_COL}`
}

export async function fetchAllMenuRowsFromSheet(): Promise<{
  rows: MenuSheetRowWithIndex[]
  tabName: string
  loadedAt: string
}> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEET_ID and service account credentials."
    )
  }

  const { menuRange, tab } = getMenuRangeConfig()
  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: dataRange(menuRange, tab),
  })

  const values = (res.data.values as string[][]) ?? []
  const parsed = parseMenuSheetRows(values)
  const slugToSheetRow = new Map<string, number>()
  if (values.length > 1) {
    const headers = (values[0] ?? []).map((h) =>
      h.trim().toLowerCase().replace(/\s+/g, "_")
    )
    const slugCol = headers.indexOf("slug")
    for (let r = 1; r < values.length; r++) {
      const slug = (values[r]?.[slugCol] ?? "").trim()
      if (slug) slugToSheetRow.set(slug, r + 1)
    }
  }
  const rows: MenuSheetRowWithIndex[] = parsed.map((row) => ({
    ...row,
    sheetRow: slugToSheetRow.get(row.slug) ?? 0,
  }))

  return {
    rows,
    tabName: tab,
    loadedAt: new Date().toISOString(),
  }
}

export type MenuItemSheetUpdate = Omit<MenuSheetRow, "slug">

export async function updateMenuSoldOutInSheet(
  sheetRow: number,
  soldOut: boolean
): Promise<void> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const { tab } = getMenuRangeConfig()
  await client.sheets.spreadsheets.values.update({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!M${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[formatBooleanForSheet(soldOut)]] },
  })
}

export async function updateMenuRowInSheet(
  sheetRow: number,
  slug: string,
  update: MenuItemSheetUpdate
): Promise<void> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const { tab } = getMenuRangeConfig()
  const row: MenuSheetRow = { slug, ...update }

  await client.sheets.spreadsheets.values.update({
    spreadsheetId: client.spreadsheetId,
    range: `${tab}!A${sheetRow}:${MENU_LAST_COL}${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [menuRowToSheetValues(row)] },
  })
}

/** When one item is featured, clear featured on all other active rows. */
export async function appendMenuRowInSheet(
  row: MenuSheetRow
): Promise<MenuSheetRowWithIndex> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error("Google Sheets is not configured.")
  }

  const { menuRange, tab } = getMenuRangeConfig()
  const range = dataRange(menuRange, tab)

  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [menuRowToSheetValues(row)] },
  })

  const { rows } = await fetchAllMenuRowsFromSheet()
  const added = rows.find((r) => r.slug === row.slug)
  if (!added) {
    throw new Error("Menu row was appended but could not be read back.")
  }
  return added
}

export async function clearFeaturedExcept(
  exceptSlug: string,
  rows: MenuSheetRowWithIndex[]
): Promise<void> {
  const client = getSheetsClient()
  if (!client) return

  const { tab } = getMenuRangeConfig()
  const updates: { range: string; values: string[][] }[] = []

  for (const row of rows) {
    if (row.slug === exceptSlug || !row.featured) continue
    updates.push({
      range: `${tab}!F${row.sheetRow}`,
      values: [[formatBooleanForSheet(false)]],
    })
  }

  if (updates.length === 0) return

  await client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: client.spreadsheetId,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates,
    },
  })
}

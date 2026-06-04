import "server-only"

import { getSheetsClient, sheetTabFromRange } from "@/lib/google-sheets/client"
import {
  activeMenuRows,
  parseMenuSheetRows,
  type MenuSheetRow,
} from "@/lib/google-sheets/menu-parse"

export const DEFAULT_MENU_RANGE = "Menu!A:M"

export type { MenuSheetRow } from "@/lib/google-sheets/menu-parse"
export { parseMenuPrice, parseMenuSheetRows } from "@/lib/google-sheets/menu-parse"

function parseEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export async function fetchMenuRowsFromSheet(): Promise<MenuSheetRow[]> {
  const client = getSheetsClient()
  if (!client) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SHEET_ID and service account credentials."
    )
  }

  const menuRange =
    parseEnv("GOOGLE_SHEETS_MENU_RANGE") ?? DEFAULT_MENU_RANGE
  const tab = sheetTabFromRange(menuRange)

  const res = await client.sheets.spreadsheets.values.get({
    spreadsheetId: client.spreadsheetId,
    range: menuRange.includes("!") ? menuRange : `${tab}!A:M`,
  })

  const rows = parseMenuSheetRows((res.data.values as string[][]) ?? [])
  return activeMenuRows(rows)
}

/** All rows including inactive (for admin). */
export { fetchAllMenuRowsFromSheet, updateMenuRowInSheet, clearFeaturedExcept } from "@/lib/google-sheets/menu-admin"
export type { MenuSheetRowWithIndex, MenuItemSheetUpdate } from "@/lib/google-sheets/menu-admin"

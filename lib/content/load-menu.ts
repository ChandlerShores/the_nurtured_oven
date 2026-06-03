import "server-only"

import { unstable_cache } from "next/cache"
import { fallbackCurrentMenu } from "@/lib/content/currentMenu"
import { buildCurrentMenuFromSheetRows } from "@/lib/content/menu-from-sheet"
import type { CurrentMenu } from "@/lib/content/menu-types"
import { fetchMenuRowsFromSheet } from "@/lib/google-sheets/menu"

export async function loadMenuFromSheet(): Promise<CurrentMenu> {
  try {
    const rows = await fetchMenuRowsFromSheet()
    const menu = buildCurrentMenuFromSheetRows(rows)
    if (menu) return menu
    console.warn(
      "[Menu] No active rows in Google Sheets Menu tab; using fallback."
    )
  } catch (err) {
    console.warn(
      "[Menu] Could not load from Google Sheets; using fallback menu.",
      err instanceof Error ? err.message : err
    )
  }
  return fallbackCurrentMenu
}

/** Cached weekly menu (Google Sheets Menu tab, with hardcoded fallback). */
export const getCurrentMenu = unstable_cache(
  loadMenuFromSheet,
  ["weekly-menu"],
  { revalidate: 300, tags: ["weekly-menu"] }
)

/**
 * Types and weekly menu data live in `menu-types.ts` and `currentMenu.ts`.
 * Import `currentMenu` for the active week; this module keeps backward-compatible exports.
 */

export type {
  MenuProduct,
  FeaturedMenuProduct,
  CurrentMenu,
  MenuOrderCta,
} from "@/lib/content/menu-types"

export { currentMenu } from "@/lib/content/currentMenu"

/** @deprecated Use `currentMenu` - kept for existing imports */
export { currentMenu as weeklyMenu } from "@/lib/content/currentMenu"

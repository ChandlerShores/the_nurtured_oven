import { revalidatePath, revalidateTag } from "next/cache"

const PUBLIC_MENU_PATHS = ["/", "/menu", "/contact"] as const

/** Bust cached menu data and pages that render the weekly menu from Sheets. */
export function revalidatePublicMenu(): void {
  revalidateTag("weekly-menu")
  for (const path of PUBLIC_MENU_PATHS) {
    revalidatePath(path)
  }
}

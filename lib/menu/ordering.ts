import type { CurrentMenu, MenuProduct } from "@/lib/content/menu-types"
import {
  getOrderingClosedMessage,
  isWeeklyOrderingAccepted,
} from "@/lib/menu/ordering-gate"

export function isMenuOpen(now?: Date): boolean {
  return isWeeklyOrderingAccepted(now)
}

export function isProductOrderable(
  orderingOpen: boolean,
  product: Pick<MenuProduct, "soldOut">
): boolean {
  return orderingOpen && !product.soldOut
}

export function resolveProductOrderHref(
  orderingOpen: boolean,
  product: Pick<MenuProduct, "slug" | "squareCheckoutUrl" | "soldOut">
): string | undefined {
  if (!isProductOrderable(orderingOpen, product)) return undefined

  const url = product.squareCheckoutUrl?.trim()
  if (url) return url

  return `/contact?intent=weekly-order&item=${encodeURIComponent(product.slug)}`
}

export function resolveOrderCtaHref(menu: CurrentMenu): string | undefined {
  if (!isMenuOpen()) return undefined

  const url = menu.orderCta.squareCheckoutUrl?.trim()
  if (url) return url

  return "/contact?intent=weekly-order"
}

export function getDisabledOrderMessage(): string {
  return getOrderingClosedMessage()
}

export function getProductGridClassName(itemCount: number): string {
  const base = "grid gap-6 w-full"
  if (itemCount <= 1) {
    return `${base} grid-cols-1 max-w-md mx-auto`
  }
  if (itemCount === 2) {
    return `${base} grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto`
  }
  if (itemCount === 4) {
    return `${base} grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto`
  }
  if (itemCount === 5) {
    return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 [&>*]:lg:col-span-2 [&>*:nth-child(4)]:lg:col-start-2 [&>*:nth-child(5)]:lg:col-start-4`
  }
  return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
}

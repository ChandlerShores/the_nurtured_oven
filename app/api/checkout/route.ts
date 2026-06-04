import { NextRequest, NextResponse } from "next/server"
import { isDeliveryCity } from "@/lib/content/fulfillment"
import { getDisabledOrderMessage, isMenuOpen } from "@/lib/menu/ordering"
import { getWeeklyCatalog } from "@/lib/order/catalog"
import {
  clampString,
  isReasonableEmail,
  readPublicJsonBody,
} from "@/lib/security/public-input"
import {
  consumeRateLimitAsync,
  delayRateLimitedResponse,
  getClientIpFromRequest,
} from "@/lib/security/rate-limit"
import { isAllowedCheckoutUrl } from "@/lib/security/safe-external-url"
import { createWeeklyCheckout } from "@/lib/square/checkout"
import { isSquareConfigured } from "@/lib/square/client"

const CHECKOUT_LIMIT = { windowMs: 15 * 60 * 1000, maxAttempts: 12 }
const MAX_QUANTITY_PER_ITEM = 20
const MAX_CART_QUANTITY = 40

export async function POST(req: NextRequest) {
  try {
    const rateKey = `checkout:${getClientIpFromRequest(req)}`
    const limit = await consumeRateLimitAsync(rateKey, CHECKOUT_LIMIT)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSec) },
        }
      )
    }

    if (!isMenuOpen()) {
      return NextResponse.json(
        { error: getDisabledOrderMessage() },
        { status: 403 }
      )
    }

    if (!isSquareConfigured()) {
      return NextResponse.json(
        {
          error:
            "Online checkout is not configured yet. Please contact us to place your order.",
        },
        { status: 503 }
      )
    }

    const parsed = await readPublicJsonBody(req)
    if (!parsed.ok) return parsed.response
    const body = parsed.body

    const name = clampString(body.name, 120)
    const email = clampString(body.email, 254)
    const phone = clampString(body.phone, 40)
    const lineItems = body.lineItems
    const fulfillment = body.fulfillment
    const deliveryCity = clampString(body.deliveryCity, 80)
    const deliveryAddress = clampString(body.deliveryAddress, 200)
    const dietary = clampString(body.dietary, 500)
    const message = clampString(body.message, 2000)

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }

    if (!isReasonableEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one item to your order." },
        { status: 400 }
      )
    }

    const catalog = await getWeeklyCatalog()
    const catalogBySlug = new Map(catalog.map((item) => [item.slug, item]))

    const mergedQuantities = new Map<string, number>()
    for (const item of lineItems) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.slug !== "string" ||
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "Each line item must include a valid menu item and quantity." },
          { status: 400 }
        )
      }

      const slug = item.slug.trim()
      const qty = Math.floor(item.quantity)
      mergedQuantities.set(slug, (mergedQuantities.get(slug) ?? 0) + qty)
    }

    const normalizedItems: { slug: string; quantity: number }[] = []
    let totalQuantity = 0
    for (const [slug, quantity] of mergedQuantities) {
      const catalogItem = catalogBySlug.get(slug)
      if (!catalogItem) {
        return NextResponse.json(
          { error: `Menu item "${slug}" is not available.` },
          { status: 400 }
        )
      }
      if (quantity > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json(
          { error: `${catalogItem.name} is limited to ${MAX_QUANTITY_PER_ITEM} per order.` },
          { status: 400 }
        )
      }
      if (catalogItem.soldOut) {
        return NextResponse.json(
          { error: `${catalogItem.name} is sold out.` },
          { status: 400 }
        )
      }
      totalQuantity += quantity
      normalizedItems.push({ slug, quantity })
    }

    if (totalQuantity > MAX_CART_QUANTITY) {
      return NextResponse.json(
        { error: `Orders are limited to ${MAX_CART_QUANTITY} total items.` },
        { status: 400 }
      )
    }

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one valid menu item." },
        { status: 400 }
      )
    }

    if (fulfillment === "delivery") {
      if (!deliveryCity?.trim() || !isDeliveryCity(deliveryCity.trim())) {
        return NextResponse.json(
          { error: "Please select Georgetown or Lexington for delivery." },
          { status: 400 }
        )
      }
      if (!deliveryAddress?.trim()) {
        return NextResponse.json(
          { error: "Please enter your street address for delivery." },
          { status: 400 }
        )
      }
    }

    const { checkoutUrl } = await createWeeklyCheckout({
      name,
      email,
      phone: phone || undefined,
      lineItems: normalizedItems,
      fulfillment: fulfillment === "delivery" ? "delivery" : "pickup",
      deliveryCity: fulfillment === "delivery" ? deliveryCity : undefined,
      deliveryAddress: deliveryAddress || undefined,
      dietary: dietary || undefined,
      message: message || undefined,
    })

    if (!isAllowedCheckoutUrl(checkoutUrl)) {
      console.error("[Checkout] Unexpected checkout URL host:", checkoutUrl)
      return NextResponse.json(
        { error: "Could not start checkout. Please contact us." },
        { status: 500 }
      )
    }

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error("[Checkout]", err)
    await delayRateLimitedResponse()
    return NextResponse.json(
      { error: "Could not start checkout. Please try again or contact us." },
      { status: 500 }
    )
  }
}

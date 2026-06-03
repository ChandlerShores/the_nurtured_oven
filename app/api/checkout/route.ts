import { NextRequest, NextResponse } from "next/server"
import { isDeliveryCity } from "@/lib/content/fulfillment"
import { getDisabledOrderMessage, isMenuOpen } from "@/lib/menu/ordering"
import { getWeeklyCatalog } from "@/lib/order/catalog"
import {
  clampString,
  isReasonableEmail,
} from "@/lib/security/public-input"
import {
  checkRateLimit,
  delayRateLimitedResponse,
  getClientIpFromRequest,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit"
import { isAllowedCheckoutUrl } from "@/lib/security/safe-external-url"
import { createWeeklyCheckout } from "@/lib/square/checkout"
import { isSquareConfigured } from "@/lib/square/client"

const CHECKOUT_LIMIT = { windowMs: 15 * 60 * 1000, maxAttempts: 12 }

export async function POST(req: NextRequest) {
  const rateKey = `checkout:${getClientIpFromRequest(req)}`
  const limit = checkRateLimit(rateKey, CHECKOUT_LIMIT)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    )
  }

  try {
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

    const body = await req.json()
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
    const catalogSlugs = new Set(catalog.map((item) => item.slug))

    const validItems = lineItems.filter(
      (item: { slug?: string; quantity?: number }) =>
        item.slug &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        catalogSlugs.has(item.slug)
    )

    if (validItems.length === 0) {
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
      lineItems: validItems.map((item: { slug: string; quantity: number }) => ({
        slug: item.slug,
        quantity: Math.min(20, Math.floor(item.quantity)),
      })),
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
    recordRateLimitFailure(rateKey, { windowMs: CHECKOUT_LIMIT.windowMs })
    await delayRateLimitedResponse()
    return NextResponse.json(
      { error: "Could not start checkout. Please try again or contact us." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { isDeliveryCity } from "@/lib/content/fulfillment"
import { getCatalogItem } from "@/lib/order/catalog"
import { getDisabledOrderMessage, isMenuOpen } from "@/lib/menu/ordering"
import { createWeeklyCheckout } from "@/lib/square/checkout"
import { isSquareConfigured } from "@/lib/square/client"

export async function POST(req: NextRequest) {
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
    const {
      name,
      email,
      phone,
      lineItems,
      fulfillment,
      deliveryCity,
      deliveryAddress,
      dietary,
      message,
    } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one item to your order." },
        { status: 400 }
      )
    }

    const validItems = lineItems.filter(
      (item: { slug?: string; quantity?: number }) =>
        item.slug &&
        typeof item.quantity === "number" &&
        item.quantity > 0 &&
        getCatalogItem(item.slug)
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
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      lineItems: validItems.map((item: { slug: string; quantity: number }) => ({
        slug: item.slug,
        quantity: Math.min(20, Math.floor(item.quantity)),
      })),
      fulfillment: fulfillment === "delivery" ? "delivery" : "pickup",
      deliveryCity:
        fulfillment === "delivery" ? deliveryCity?.trim() : undefined,
      deliveryAddress: deliveryAddress?.trim(),
      dietary: dietary?.trim(),
      message: message?.trim(),
    })

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error("[Checkout]", err)
    const message =
      err instanceof Error ? err.message : "Could not start checkout."
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

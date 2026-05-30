import { NextRequest, NextResponse } from "next/server"
import { sendInquiryEmail } from "@/lib/email"
import { siteConfig } from "@/lib/content/site"
import { isGiftContactIntentEnabled } from "@/lib/content/launch"
import { getOrderingClosedMessage, isWeeklyOrderingAccepted } from "@/lib/menu/ordering-gate"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      intent,
      name,
      email,
      phone,
      items,
      fulfillment,
      deliveryCity,
      deliveryAddress,
      giftRecipient,
      giftMessage,
      giftOccasion,
      dietary,
      message,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }

    if (intent === "gift" && !isGiftContactIntentEnabled()) {
      return NextResponse.json(
        { error: "Gift box requests are not available right now." },
        { status: 400 }
      )
    }

    if (intent === "weekly-order" && !isWeeklyOrderingAccepted()) {
      return NextResponse.json(
        { error: getOrderingClosedMessage() },
        { status: 403 }
      )
    }

    if ((intent === "weekly-order" || intent === "gift") && !items) {
      return NextResponse.json(
        { error: "Please specify what you'd like to order." },
        { status: 400 }
      )
    }

    const ownerEmail =
      process.env.OWNER_EMAIL || siteConfig.ownerEmail

    const result = await sendInquiryEmail(
      {
        intent: intent || "general",
        name,
        email,
        phone,
        items,
        fulfillment,
        deliveryCity,
        deliveryAddress,
        giftRecipient,
        giftMessage,
        giftOccasion,
        dietary,
        message,
      },
      ownerEmail
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Something went wrong." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    )
  }
}

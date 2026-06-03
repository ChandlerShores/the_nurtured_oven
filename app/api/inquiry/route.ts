import { NextRequest, NextResponse } from "next/server"
import { isGiftContactIntentEnabled } from "@/lib/content/launch"
import { siteConfig } from "@/lib/content/site"
import { sendInquiryEmail } from "@/lib/email"
import { getOrderingClosedMessage, isWeeklyOrderingAccepted } from "@/lib/menu/ordering-gate"
import {
  clampString,
  isReasonableEmail,
  parseInquiryIntent,
} from "@/lib/security/public-input"
import {
  checkRateLimit,
  delayRateLimitedResponse,
  getClientIpFromRequest,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit"

const INQUIRY_LIMIT = { windowMs: 15 * 60 * 1000, maxAttempts: 6 }

export async function POST(req: NextRequest) {
  const rateKey = `inquiry:${getClientIpFromRequest(req)}`
  const limit = checkRateLimit(rateKey, INQUIRY_LIMIT)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      }
    )
  }

  try {
    const body = await req.json()

    const intent = parseInquiryIntent(body.intent)
    const name = clampString(body.name, 120)
    const email = clampString(body.email, 254)
    const phone = clampString(body.phone, 40)
    const items = clampString(body.items, 2000)
    const fulfillment = clampString(body.fulfillment, 32)
    const deliveryCity = clampString(body.deliveryCity, 80)
    const deliveryAddress = clampString(body.deliveryAddress, 200)
    const giftRecipient = clampString(body.giftRecipient, 120)
    const giftMessage = clampString(body.giftMessage, 2000)
    const giftOccasion = clampString(body.giftOccasion, 120)
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
        intent,
        name,
        email,
        phone: phone || undefined,
        items: items || undefined,
        fulfillment: fulfillment || undefined,
        deliveryCity: deliveryCity || undefined,
        deliveryAddress: deliveryAddress || undefined,
        giftRecipient: giftRecipient || undefined,
        giftMessage: giftMessage || undefined,
        giftOccasion: giftOccasion || undefined,
        dietary: dietary || undefined,
        message: message || undefined,
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
    recordRateLimitFailure(rateKey, { windowMs: INQUIRY_LIMIT.windowMs })
    await delayRateLimitedResponse()
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    )
  }
}

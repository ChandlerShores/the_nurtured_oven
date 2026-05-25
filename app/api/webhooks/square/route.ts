import { NextRequest, NextResponse } from "next/server"
import { WebhooksHelper } from "square"
import { sendPaidOrderEmails } from "@/lib/email"
import { siteConfig } from "@/lib/content/site"
import { resolvePaidOrderDetails } from "@/lib/square/resolve-paid-order"
import {
  hasProcessedSquarePayment,
  markSquarePaymentProcessed,
} from "@/lib/square/webhook-dedupe"

export async function POST(req: NextRequest) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL

  const body = await req.text()

  if (signatureKey && notificationUrl) {
    const signature = req.headers.get("x-square-hmacsha256-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const isValid = WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey,
      notificationUrl,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[Square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY or SQUARE_WEBHOOK_NOTIFICATION_URL not set"
    )
  }

  let event: {
    type?: string
    data?: {
      type?: string
      object?: {
        payment?: {
          id?: string
          status?: string
          order_id?: string
          note?: string
          receipt_url?: string
          buyer_email_address?: string
          amount_money?: { amount?: bigint | number; currency?: string }
        }
      }
    }
  }

  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const payment = event.data?.object?.payment
  const eventType = event.type

  if (eventType === "payment.updated" && payment?.status === "COMPLETED") {
    const paymentId = payment.id

    if (paymentId && (await hasProcessedSquarePayment(paymentId))) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    const ownerEmail =
      process.env.OWNER_EMAIL || siteConfig.ownerEmail

    const details = await resolvePaidOrderDetails(payment)

    await sendPaidOrderEmails(details, ownerEmail)

    if (paymentId) {
      await markSquarePaymentProcessed(paymentId, payment.order_id)
    }
  }

  return NextResponse.json({ received: true })
}

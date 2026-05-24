import { NextRequest, NextResponse } from "next/server"
import { WebhooksHelper } from "square"
import { sendPaidOrderEmails } from "@/lib/email"
import { siteConfig } from "@/lib/content/site"

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

  if (
    eventType === "payment.updated" &&
    payment?.status === "COMPLETED"
  ) {
    const ownerEmail =
      process.env.OWNER_EMAIL || siteConfig.ownerEmail

    await sendPaidOrderEmails(
      {
        orderId: payment.order_id,
        paymentNote: payment.note,
        buyerEmail: payment.buyer_email_address,
        receiptUrl: payment.receipt_url,
        amountCents: payment.amount_money?.amount
          ? Number(payment.amount_money.amount)
          : undefined,
      },
      ownerEmail
    )
  }

  return NextResponse.json({ received: true })
}

import { NextRequest, NextResponse } from "next/server"
import { WebhooksHelper } from "square"
import { processPaymentWebhookEvent } from "@/lib/square/process-payment-webhook"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function webhookJson(
  body: Record<string, unknown>,
  init?: ResponseInit
): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  })
}

function getWebhookConfig(): {
  signatureKey: string
  notificationUrl: string
} | null {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim()
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim()

  if (!signatureKey || !notificationUrl) return null
  return { signatureKey, notificationUrl }
}

async function verifySquareSignature(
  body: string,
  signatureHeader: string | null,
  config: { signatureKey: string; notificationUrl: string }
): Promise<boolean> {
  if (!signatureHeader) return false

  return WebhooksHelper.verifySignature({
    requestBody: body,
    signatureHeader,
    signatureKey: config.signatureKey,
    notificationUrl: config.notificationUrl,
  })
}

export async function POST(req: NextRequest) {
  const config = getWebhookConfig()
  if (!config) {
    console.error(
      "[Square webhook] SQUARE_WEBHOOK_SIGNATURE_KEY and SQUARE_WEBHOOK_NOTIFICATION_URL must be set"
    )
    return webhookJson(
      { error: "Webhook verification is not configured" },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get("x-square-hmacsha256-signature")

  if (!(await verifySquareSignature(body, signature, config))) {
    return webhookJson({ error: "Invalid signature" }, { status: 401 })
  }

  let event: Parameters<typeof processPaymentWebhookEvent>[0]

  try {
    event = JSON.parse(body)
  } catch {
    return webhookJson({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const result = await processPaymentWebhookEvent(event)
    if (result.action === "in_progress") {
      return webhookJson(
        {
          received: true,
          ...result,
        },
        {
          status: 503,
          headers: { "Retry-After": "30" },
        }
      )
    }
    return webhookJson({
      received: true,
      ...result,
    })
  } catch (err) {
    console.error("[Square webhook] Handler error:", err)
    return webhookJson(
      {
        received: true,
        action: "error",
        error: "Internal handler error",
      },
      { status: 500 }
    )
  }
}

/** Square may POST to a trailing-slash URL; respond directly without redirect. */
export async function GET() {
  return webhookJson({ ok: true, endpoint: "square-webhook" })
}

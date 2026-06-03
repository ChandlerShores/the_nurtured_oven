import { NextResponse } from "next/server"
import { isCustomerEmailType } from "@/lib/admin/customer-email-types"
import {
  parseAdminInternalRef,
  readAdminJsonBody,
} from "@/lib/admin/api-input"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { sendCustomerOrderEmail } from "@/lib/admin/send-customer-order-email"
import { fetchCustomerEmailsForOrder } from "@/lib/google-sheets/customer-emails"
import { clampString } from "@/lib/security/public-input"

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const internalRef = parseAdminInternalRef(
    new URL(request.url).searchParams.get("internalRef")
  )
  if (!internalRef) {
    return NextResponse.json(
      { error: "Valid internalRef is required." },
      { status: 400 }
    )
  }

  try {
    const history = await fetchCustomerEmailsForOrder(internalRef)
    return NextResponse.json({ history })
  } catch (err) {
    console.error("[admin] customer email history failed", err)
    return NextResponse.json(
      { error: "Could not load email history." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const parsed = await readAdminJsonBody(request)
  if (!parsed.ok) return parsed.response

  const internalRef = parseAdminInternalRef(parsed.body.internalRef)
  const type = clampString(parsed.body.type, 32)

  if (!internalRef) {
    return NextResponse.json(
      { error: "Valid internalRef is required." },
      { status: 400 }
    )
  }

  if (!isCustomerEmailType(type)) {
    return NextResponse.json({ error: "Invalid email type." }, { status: 400 })
  }

  try {
    const result = await sendCustomerOrderEmail({
      internalRef,
      type,
      customSubject: clampString(parsed.body.subject, 200),
      customMessage: clampString(parsed.body.message, 4000),
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Could not send email." },
        { status: 400 }
      )
    }

    const history = await fetchCustomerEmailsForOrder(internalRef)

    return NextResponse.json({
      ok: true,
      skipped: result.skipped,
      messageId: result.messageId,
      subject: result.subject,
      history,
    })
  } catch (err) {
    console.error("[admin] customer email send failed", err)
    return NextResponse.json(
      { error: "Could not send customer email." },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { isCustomerEmailType } from "@/lib/admin/customer-email-types"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { sendCustomerOrderEmail } from "@/lib/admin/send-customer-order-email"
import { fetchCustomerEmailsForOrder } from "@/lib/google-sheets/customer-emails"

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  const internalRef =
    new URL(request.url).searchParams.get("internalRef")?.trim() ?? ""
  if (!internalRef) {
    return NextResponse.json(
      { error: "internalRef is required." },
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

  let body: {
    internalRef?: string
    type?: string
    subject?: string
    message?: string
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const internalRef = body.internalRef?.trim() ?? ""
  const type = body.type?.trim() ?? ""

  if (!internalRef) {
    return NextResponse.json(
      { error: "internalRef is required." },
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
      customSubject: body.subject,
      customMessage: body.message,
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

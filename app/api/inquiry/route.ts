import { NextRequest, NextResponse } from "next/server"
import { sendInquiryEmail } from "@/lib/email"
import { siteConfig } from "@/lib/content/site"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, email, phone, items, fulfillment, date, dietary, message } =
      body

    if (!name || !email || !items) {
      return NextResponse.json(
        { error: "Name, email, and items are required." },
        { status: 400 }
      )
    }

    const ownerEmail =
      process.env.OWNER_EMAIL || siteConfig.ownerEmail

    const result = await sendInquiryEmail(
      { name, email, phone, items, fulfillment, date, dietary, message },
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

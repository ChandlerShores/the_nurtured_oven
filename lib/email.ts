interface InquiryData {
  intent: "weekly-order" | "gift" | "reminder" | "general"
  name: string
  email: string
  phone?: string
  items?: string
  fulfillment?: string
  deliveryAddress?: string
  giftRecipient?: string
  giftMessage?: string
  giftOccasion?: string
  dietary?: string
  message?: string
}

const intentSubjects: Record<InquiryData["intent"], string> = {
  "weekly-order": "Weekly Order Request",
  gift: "Gift Box Request",
  reminder: "Menu Reminder Signup",
  general: "General Inquiry",
}

function formatEmailBody(data: InquiryData): string {
  const heading = `${intentSubjects[data.intent]} from ${data.name}`
  const divider = "=".repeat(40)

  const lines: (string | null)[] = [
    heading,
    divider,
    "",
    `Type: ${intentSubjects[data.intent]}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
  ]

  if (data.intent === "weekly-order") {
    lines.push(
      "",
      `Items: ${data.items}`,
      `Fulfillment: ${data.fulfillment || "pickup"}`,
      data.deliveryAddress ? `Delivery address: ${data.deliveryAddress}` : null,
      data.dietary ? `Allergy/dietary notes: ${data.dietary}` : null,
      data.message ? `\nAdditional notes: ${data.message}` : null,
      "",
      ">> Order submitted via website inquiry (not Square checkout).",
    )
  }

  if (data.intent === "gift") {
    lines.push(
      "",
      `Box: ${data.items}`,
      data.giftRecipient ? `Recipient: ${data.giftRecipient}` : null,
      data.giftOccasion ? `Occasion: ${data.giftOccasion}` : null,
      data.giftMessage ? `Gift message: ${data.giftMessage}` : null,
      `Fulfillment: ${data.fulfillment || "pickup"}`,
      data.deliveryAddress ? `Delivery address: ${data.deliveryAddress}` : null,
      data.dietary ? `Allergy/dietary notes: ${data.dietary}` : null,
      data.message ? `\nAdditional notes: ${data.message}` : null,
      "",
      ">> Follow up with customer to finalize gift order and payment.",
    )
  }

  if (data.intent === "reminder") {
    lines.push(
      "",
      ">> Add to Friday menu reminder list.",
    )
  }

  if (data.intent === "general") {
    lines.push(
      "",
      data.message ? `Message: ${data.message}` : null,
    )
  }

  lines.push("", divider, "Sent from The Nurtured Oven website.")

  return lines.filter((l): l is string => l !== null).join("\n")
}

export async function sendInquiryEmail(
  data: InquiryData,
  ownerEmail: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log("[Email] RESEND_API_KEY not configured. Logging inquiry:")
    console.log(formatEmailBody(data))
    return { success: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Nurtured Oven <orders@thenurturedoven.com>",
        to: [ownerEmail],
        reply_to: data.email,
        subject: `${intentSubjects[data.intent]} from ${data.name}`,
        text: formatEmailBody(data),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[Email] Resend error:", err)
      return { success: false, error: "Failed to send email" }
    }

    return { success: true }
  } catch (err) {
    console.error("[Email] Network error:", err)
    return { success: false, error: "Failed to send email" }
  }
}

export interface PaidOrderEmailData {
  orderId?: string
  paymentNote?: string
  buyerEmail?: string
  receiptUrl?: string
  amountCents?: number
}

function formatPaidOrderBody(
  data: PaidOrderEmailData,
  audience: "owner" | "customer"
): string {
  const divider = "=".repeat(40)
  const amount =
    data.amountCents != null
      ? `$${(data.amountCents / 100).toFixed(2)}`
      : "See Square receipt"

  const lines: (string | null)[] =
    audience === "owner"
      ? [
          "Paid weekly order (Square)",
          divider,
          "",
          data.buyerEmail ? `Customer email: ${data.buyerEmail}` : null,
          `Amount: ${amount}`,
          data.orderId ? `Square order ID: ${data.orderId}` : null,
          data.paymentNote ? `\nOrder details:\n${data.paymentNote}` : null,
          data.receiptUrl ? `\nReceipt: ${data.receiptUrl}` : null,
          "",
          ">> Fulfill on Friday. Customer has been emailed a confirmation.",
        ]
      : [
          "Your weekly order is confirmed!",
          divider,
          "",
          "Thank you for ordering from The Nurtured Oven.",
          `Amount paid: ${amount}`,
          data.paymentNote
            ? `\nYour order:\n${data.paymentNote.replace(/\s*\|\s*/g, "\n")}`
            : null,
          "",
          "We'll follow up with Friday pickup or Georgetown/Lexington delivery details if needed.",
          data.receiptUrl ? `\nView your receipt: ${data.receiptUrl}` : null,
        ]

  lines.push("", divider)
  return lines.filter((l): l is string => l !== null).join("\n")
}

async function sendEmailMessage(options: {
  to: string[]
  subject: string
  text: string
  replyTo?: string
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log(`[Email] ${options.subject}`)
    console.log(options.text)
    return { success: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Nurtured Oven <orders@thenurturedoven.com>",
        to: options.to,
        reply_to: options.replyTo,
        subject: options.subject,
        text: options.text,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[Email] Resend error:", err)
      return { success: false, error: "Failed to send email" }
    }

    return { success: true }
  } catch (err) {
    console.error("[Email] Network error:", err)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendPaidOrderEmails(
  data: PaidOrderEmailData,
  ownerEmail: string
): Promise<void> {
  await sendEmailMessage({
    to: [ownerEmail],
    subject: `Paid weekly order${data.buyerEmail ? ` — ${data.buyerEmail}` : ""}`,
    text: formatPaidOrderBody(data, "owner"),
    replyTo: data.buyerEmail,
  })

  if (data.buyerEmail) {
    await sendEmailMessage({
      to: [data.buyerEmail],
      subject: "Your Nurtured Oven order is confirmed",
      text: formatPaidOrderBody(data, "customer"),
    })
  }
}

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
      ">> Send Square payment link to confirm this order.",
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
      ">> Send Square payment link to confirm this gift order.",
    )
  }

  if (data.intent === "reminder") {
    lines.push(
      "",
      ">> Add to Saturday menu reminder list.",
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

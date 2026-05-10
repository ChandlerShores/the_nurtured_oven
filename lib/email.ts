interface InquiryData {
  name: string
  email: string
  phone?: string
  items: string
  fulfillment: string
  date: string
  dietary?: string
  message?: string
}

function formatEmailBody(data: InquiryData): string {
  const lines = [
    `New Order Inquiry from ${data.name}`,
    `${"=".repeat(40)}`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    ``,
    `Interested in: ${data.items}`,
    `Fulfillment: ${data.fulfillment}`,
    `Desired date: ${data.date}`,
    data.dietary ? `\nDietary/allergy notes: ${data.dietary}` : null,
    data.message ? `\nMessage: ${data.message}` : null,
    ``,
    `${"=".repeat(40)}`,
    `This inquiry was sent from The Nurtured Oven website.`,
  ]

  return lines.filter(Boolean).join("\n")
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
        subject: `New Order Inquiry from ${data.name}`,
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

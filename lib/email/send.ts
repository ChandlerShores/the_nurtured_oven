import { formatFromHeader, getEmailConfig, isEmailConfigured } from "@/lib/email/config"

export interface SendEmailInput {
  to: string[]
  subject: string
  text: string
  html: string
  /** Overrides default reply-to (e.g. customer email on owner notifications). */
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  skipped?: boolean
  error?: string
}

function logSkippedEmail(input: SendEmailInput): void {
  const recipients = input.to.join(", ")
  console.warn(
    `[Email] Skipped — Resend is not configured (set RESEND_API_KEY).` +
      ` Would send "${input.subject}" to ${recipients}.`
  )
  console.log("[Email] Text preview:\n" + input.text)
  console.log("[Email] HTML length:", input.html.length, "chars")
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    logSkippedEmail(input)
    return { success: true, skipped: true }
  }

  const config = getEmailConfig()

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: formatFromHeader(config),
        to: input.to,
        reply_to: input.replyTo ?? config.replyToEmail,
        subject: input.subject,
        text: input.text,
        html: input.html,
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

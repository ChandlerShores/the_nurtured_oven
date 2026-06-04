import { formatFromHeader, getEmailConfig, isEmailConfigured } from "@/lib/email/config"

export const EMAIL_SEND_TIMEOUT_MS = 15_000

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
  /** Resend email id when sent successfully. */
  messageId?: string
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
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EMAIL_SEND_TIMEOUT_MS)

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
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      let message = "Failed to send email"
      try {
        const parsed = JSON.parse(err) as { message?: string }
        if (parsed.message) message = parsed.message
      } catch {
        /* use default message */
      }
      console.error("[Email] Resend error:", err)
      return { success: false, error: message }
    }

    let messageId: string | undefined
    try {
      const data = (await res.json()) as { id?: string }
      messageId = data.id?.trim() || undefined
    } catch {
      /* body may be empty on some responses */
    }

    return { success: true, messageId }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.error("[Email] Resend request timed out.")
      return { success: false, error: "Email request timed out" }
    }
    console.error("[Email] Network error:", err)
    return { success: false, error: "Failed to send email" }
  } finally {
    clearTimeout(timeout)
  }
}

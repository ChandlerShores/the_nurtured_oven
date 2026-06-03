import type { InquiryIntent } from "@/lib/email/inquiry-email"

const INQUIRY_INTENTS = new Set<InquiryIntent>([
  "weekly-order",
  "gift",
  "reminder",
  "general",
])

export function clampString(
  value: unknown,
  maxLen: number
): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLen)
}

export function parseInquiryIntent(value: unknown): InquiryIntent {
  const intent = clampString(value, 32)
  if (INQUIRY_INTENTS.has(intent as InquiryIntent)) {
    return intent as InquiryIntent
  }
  return "general"
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isReasonableEmail(email: string): boolean {
  return email.length >= 5 && email.length <= 254 && EMAIL_RE.test(email)
}

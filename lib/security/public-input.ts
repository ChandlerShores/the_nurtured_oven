import type { InquiryIntent } from "@/lib/email/inquiry-email"
import { NextResponse } from "next/server"

export const PUBLIC_JSON_MAX_BYTES = 48_000

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

export async function readPublicJsonBody(
  request: Request
): Promise<
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: NextResponse }
> {
  const raw = await request.text()
  if (!raw.trim()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
    }
  }
  if (raw.length > PUBLIC_JSON_MAX_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request too large." }, { status: 413 }),
    }
  }
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
      }
    }
    return { ok: true, body: parsed as Record<string, unknown> }
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request." }, { status: 400 }),
    }
  }
}

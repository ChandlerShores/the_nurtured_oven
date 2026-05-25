import { siteConfig } from "@/lib/content/site"

export interface EmailConfig {
  resendApiKey?: string
  ownerEmail: string
  fromAddress: string
  fromName: string
  /** Reply-to on customer-facing emails (order confirmations, inquiry auto-replies). */
  replyToEmail: string
}

const DEFAULT_FROM_NAME = "The Nurtured Oven"

export function getEmailConfig(): EmailConfig {
  const ownerEmail =
    process.env.OWNER_EMAIL?.trim() || siteConfig.ownerEmail

  const replyToEmail =
    process.env.EMAIL_REPLY_TO?.trim() || ownerEmail

  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS?.trim() || replyToEmail

  const fromName =
    process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME

  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || undefined,
    ownerEmail,
    fromAddress,
    fromName,
    replyToEmail,
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(getEmailConfig().resendApiKey)
}

export function formatFromHeader(config: EmailConfig = getEmailConfig()): string {
  return `${config.fromName} <${config.fromAddress}>`
}

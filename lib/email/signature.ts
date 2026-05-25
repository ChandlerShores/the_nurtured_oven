import { siteConfig } from "@/lib/content/site"

/** Shared closing for customer-facing emails. */
export function customerEmailSignature(replyToHint?: string): string {
  const reply =
    replyToHint ??
    "Reply to this email and we will get back to you as soon as we can."

  return [
    "",
    "With care,",
    siteConfig.brandName,
    "",
    reply,
  ].join("\n")
}

/** Minimal footer for owner-facing emails. */
export function ownerEmailFooter(): string {
  return `\n—\nSent from the ${siteConfig.brandName} website.`
}

import { formatDeliveryLine } from "@/lib/content/fulfillment"
import { siteConfig } from "@/lib/content/site"
import { customerEmailSignature, ownerEmailFooter } from "@/lib/email/signature"

export type InquiryIntent = "weekly-order" | "gift" | "reminder" | "general"

export interface InquiryEmailData {
  intent: InquiryIntent
  name: string
  email: string
  phone?: string
  items?: string
  fulfillment?: string
  deliveryCity?: string
  deliveryAddress?: string
  giftRecipient?: string
  giftMessage?: string
  giftOccasion?: string
  dietary?: string
  message?: string
}

const intentLabels: Record<InquiryIntent, string> = {
  "weekly-order": "Weekly order inquiry",
  gift: "Gift box request",
  reminder: "Menu reminder signup",
  general: "General inquiry",
}

function formatFulfillmentSummary(data: InquiryEmailData): string | null {
  const method =
    data.fulfillment === "delivery"
      ? "Delivery"
      : data.fulfillment === "pickup"
        ? "Pickup"
        : data.fulfillment?.trim()

  const delivery = formatDeliveryLine(data.deliveryCity, data.deliveryAddress)

  if (method && delivery) return `${method} — ${delivery}`
  if (method) return method
  if (delivery) return delivery
  return null
}

export function formatInquiryOwnerSubject(data: InquiryEmailData): string {
  return `${intentLabels[data.intent]} — ${data.name}`
}

export function formatInquiryOwnerBody(data: InquiryEmailData): string {
  const divider = "—".repeat(36)
  const lines: (string | null)[] = [
    intentLabels[data.intent].toUpperCase(),
    divider,
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone?.trim() ? `Phone: ${data.phone.trim()}` : null,
  ]

  if (data.intent === "weekly-order" || data.intent === "gift") {
    lines.push(
      "",
      data.items?.trim() ? `Requested: ${data.items.trim()}` : null,
      formatFulfillmentSummary(data)
        ? `Fulfillment: ${formatFulfillmentSummary(data)}`
        : null,
      data.dietary?.trim() ? `Dietary / allergies: ${data.dietary.trim()}` : null,
      data.message?.trim() ? `Notes from customer:\n${data.message.trim()}` : null
    )
  }

  if (data.intent === "gift") {
    lines.push(
      "",
      data.giftRecipient?.trim()
        ? `Gift recipient: ${data.giftRecipient.trim()}`
        : null,
      data.giftOccasion?.trim()
        ? `Occasion: ${data.giftOccasion.trim()}`
        : null,
      data.giftMessage?.trim()
        ? `Message for recipient:\n${data.giftMessage.trim()}`
        : null,
      "",
      "Next step: Reply to the customer to confirm details and arrange payment."
    )
  }

  if (data.intent === "weekly-order") {
    lines.push(
      "",
      "This was submitted through the inquiry form (not Square checkout).",
      "Follow up with the customer to confirm the order and payment."
    )
  }

  if (data.intent === "reminder") {
    lines.push("", "Add this email to your Friday menu reminder list.")
  }

  if (data.intent === "general") {
    lines.push(
      "",
      data.message?.trim() ? `Message:\n${data.message.trim()}` : null
    )
  }

  lines.push(ownerEmailFooter())

  return lines.filter((l): l is string => l !== null).join("\n")
}

export function formatInquiryCustomerSubject(
  data: InquiryEmailData
): string {
  switch (data.intent) {
    case "gift":
      return `We received your gift box request — ${siteConfig.brandName}`
    case "reminder":
      return `You're on the list — ${siteConfig.brandName}`
    case "weekly-order":
      return `We received your order note — ${siteConfig.brandName}`
    default:
      return `Thanks for reaching out — ${siteConfig.brandName}`
  }
}

export function formatInquiryCustomerBody(data: InquiryEmailData): string {
  const firstName = data.name.trim().split(/\s+/)[0] || "there"

  const introByIntent: Record<InquiryIntent, string> = {
    gift: `Hi ${firstName},\n\nThank you for your gift box request. We have received your details and will be in touch ${siteConfig.responseWindow} to confirm your order and next steps.`,
    reminder: `Hi ${firstName},\n\nYou are on our list for Friday menu reminders. We will email you when the next menu opens.`,
    "weekly-order": `Hi ${firstName},\n\nThank you for reaching out about a weekly order. We have received your message and will follow up ${siteConfig.responseWindow} to confirm your order.`,
    general: `Hi ${firstName},\n\nThank you for contacting ${siteConfig.brandName}. We have received your message and will reply ${siteConfig.responseWindow}.`,
  }

  const lines: string[] = [introByIntent[data.intent]]

  if (data.intent === "gift" && data.items?.trim()) {
    lines.push("", `Requested: ${data.items.trim()}`)
  }

  if (data.intent === "general" && data.message?.trim()) {
    lines.push("", "Your message:", data.message.trim())
  }

  lines.push(customerEmailSignature())

  return lines.join("\n")
}

/** Gift and general inquiries get a customer confirmation; reminder and weekly inquiry optional. */
export function shouldSendInquiryCustomerReply(
  intent: InquiryIntent
): boolean {
  return intent === "gift" || intent === "general" || intent === "reminder"
}

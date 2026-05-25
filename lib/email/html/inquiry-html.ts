import { formatDeliveryLine } from "@/lib/content/fulfillment"
import { siteConfig } from "@/lib/content/site"
import {
  formatInquiryCustomerBody,
  formatInquiryCustomerSubject,
  formatInquiryOwnerBody,
  formatInquiryOwnerSubject,
  type InquiryEmailData,
  type InquiryIntent,
} from "@/lib/email/inquiry-email"
import {
  emailLayout,
  htmlKeyValue,
  htmlNote,
  htmlParagraph,
  htmlSection,
} from "@/lib/email/html/layout"
import type { EmailContent } from "@/lib/email/types"

const intentLabels: Record<InquiryIntent, string> = {
  "weekly-order": "Weekly order inquiry",
  gift: "Gift box request",
  reminder: "Menu reminder",
  general: "General inquiry",
}

function customerIntro(data: InquiryEmailData): string {
  const firstName = data.name.trim().split(/\s+/)[0] || "there"
  const introByIntent: Record<InquiryIntent, string> = {
    gift: `Hi ${firstName}, thank you for your gift box request. We have received your details and will be in touch ${siteConfig.responseWindow} to confirm your order and next steps.`,
    reminder: `Hi ${firstName}, you are on our list for Friday menu reminders. We will email you when the next menu opens.`,
    "weekly-order": `Hi ${firstName}, thank you for reaching out about a weekly order. We will follow up ${siteConfig.responseWindow} to confirm your order.`,
    general: `Hi ${firstName}, thank you for contacting ${siteConfig.brandName}. We have received your message and will reply ${siteConfig.responseWindow}.`,
  }
  return introByIntent[data.intent]
}

function badgeForIntent(intent: InquiryIntent) {
  if (intent === "gift") return { label: "Gift request", tone: "gift" as const }
  if (intent === "reminder") return { label: "Reminder", tone: "neutral" as const }
  return { label: "Inquiry", tone: "neutral" as const }
}

export function buildInquiryOwnerEmail(data: InquiryEmailData): EmailContent {
  const contactInner = [
    htmlKeyValue("Name", data.name),
    htmlKeyValue("Email", data.email),
    data.phone?.trim() ? htmlKeyValue("Phone", data.phone.trim()) : "",
  ].join("")

  const detailsParts: string[] = []
  if (data.items?.trim()) {
    detailsParts.push(htmlKeyValue("Requested", data.items.trim()))
  }

  const fulfillment = (() => {
    const method =
      data.fulfillment === "delivery"
        ? "Delivery"
        : data.fulfillment === "pickup"
          ? "Pickup"
          : data.fulfillment?.trim()
    const line = formatDeliveryLine(data.deliveryCity, data.deliveryAddress)
    if (method && line) return `${method} — ${line}`
    return method || line || null
  })()

  if (fulfillment) detailsParts.push(htmlKeyValue("Fulfillment", fulfillment))
  if (data.dietary?.trim()) {
    detailsParts.push(htmlKeyValue("Dietary / allergies", data.dietary.trim()))
  }
  if (data.message?.trim()) {
    detailsParts.push(htmlKeyValue("Customer notes", data.message.trim()))
  }

  if (data.intent === "gift") {
    if (data.giftRecipient?.trim()) {
      detailsParts.push(htmlKeyValue("Gift recipient", data.giftRecipient.trim()))
    }
    if (data.giftOccasion?.trim()) {
      detailsParts.push(htmlKeyValue("Occasion", data.giftOccasion.trim()))
    }
    if (data.giftMessage?.trim()) {
      detailsParts.push(
        htmlKeyValue("Message for recipient", data.giftMessage.trim())
      )
    }
    detailsParts.push(
      htmlNote(
        "Next step: Reply to the customer to confirm details and arrange payment."
      )
    )
  }

  if (data.intent === "weekly-order") {
    detailsParts.push(
      htmlNote(
        "Submitted via inquiry form (not Square checkout). Follow up to confirm order and payment."
      )
    )
  }

  if (data.intent === "reminder") {
    detailsParts.push(htmlNote("Add this email to your Friday menu reminder list."))
  }

  const bodyHtml = [
    htmlSection("Contact", contactInner),
    detailsParts.length
      ? htmlSection("Request details", detailsParts.join(""))
      : "",
  ].join("")

  const html = emailLayout({
    preheader: `${intentLabels[data.intent]} from ${data.name}`,
    title: intentLabels[data.intent],
    badge: badgeForIntent(data.intent),
    bodyHtml,
    footerHtml: `<p style="margin:0;font-size:12px;color:#7F8672;">Sent from The Nurtured Oven website.</p>`,
    variant: "owner",
  })

  return {
    subject: formatInquiryOwnerSubject(data),
    text: formatInquiryOwnerBody(data),
    html,
  }
}

export function buildInquiryCustomerEmail(data: InquiryEmailData): EmailContent {
  const bodyParts = [htmlParagraph(customerIntro(data))]

  if (data.intent === "gift" && data.items?.trim()) {
    bodyParts.push(htmlSection("Requested", htmlKeyValue("Box", data.items.trim())))
  }

  if (data.intent === "general" && data.message?.trim()) {
    bodyParts.push(
      htmlSection("Your message", htmlParagraph(data.message.trim()))
    )
  }

  const html = emailLayout({
    preheader: `We received your message — ${siteConfig.brandName}`,
    title: "We received your message",
    badge: badgeForIntent(data.intent),
    bodyHtml: bodyParts.join(""),
    variant: "customer",
  })

  return {
    subject: formatInquiryCustomerSubject(data),
    text: formatInquiryCustomerBody(data),
    html,
  }
}

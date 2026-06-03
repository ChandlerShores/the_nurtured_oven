import { customerFirstName } from "@/lib/email/customer-first-name"
import { emailLayout, htmlParagraph } from "@/lib/email/html/layout"
import { customerEmailSignature } from "@/lib/email/signature"
import type { EmailContent } from "@/lib/email/types"
import { getEmailConfig } from "@/lib/email/config"

export interface CustomerOrderUpdateContext {
  customerName: string
  internalRef: string
}

function greeting(ctx: CustomerOrderUpdateContext): string {
  return `Hi ${customerFirstName(ctx.customerName)},`
}

function textSignoff(): string {
  return customerEmailSignature(getEmailConfig().replyToEmail)
}

export function buildReadyForPickupEmail(
  ctx: CustomerOrderUpdateContext
): EmailContent {
  const subject = "Your order is ready for pickup"
  const refLine = ctx.internalRef
    ? `Order reference: ${ctx.internalRef}`
    : ""

  const text = [
    greeting(ctx),
    "",
    "Great news — your order from The Nurtured Oven is packed and ready for pickup.",
    refLine,
    "",
    "When you arrive, let us know your name and we will hand off your box.",
    "",
    textSignoff(),
  ]
    .filter(Boolean)
    .join("\n")

  const bodyHtml = [
    htmlParagraph(`${greeting(ctx)}`),
    htmlParagraph(
      "Great news — your order from The Nurtured Oven is packed and ready for pickup."
    ),
    ctx.internalRef
      ? htmlParagraph(`Order reference: ${ctx.internalRef}`)
      : "",
    htmlParagraph(
      "When you arrive, let us know your name and we will hand off your box."
    ),
  ].join("")

  const html = emailLayout({
    preheader: "Your weekly bake is ready to pick up.",
    title: "Ready for pickup",
    badge: { label: "Pickup", tone: "pickup" },
    bodyHtml,
    variant: "customer",
  })

  return { subject, text, html }
}

export function buildOutForDeliveryEmail(
  ctx: CustomerOrderUpdateContext
): EmailContent {
  const subject = "Your order is out for delivery"

  const text = [
    greeting(ctx),
    "",
    "Your order from The Nurtured Oven is on its way to you.",
    ctx.internalRef ? `Order reference: ${ctx.internalRef}` : "",
    "",
    "Please keep an eye out — we will do our best to arrive during your Friday delivery window.",
    "",
    textSignoff(),
  ]
    .filter(Boolean)
    .join("\n")

  const bodyHtml = [
    htmlParagraph(`${greeting(ctx)}`),
    htmlParagraph("Your order from The Nurtured Oven is on its way to you."),
    ctx.internalRef
      ? htmlParagraph(`Order reference: ${ctx.internalRef}`)
      : "",
    htmlParagraph(
      "Please keep an eye out — we will do our best to arrive during your Friday delivery window."
    ),
  ].join("")

  const html = emailLayout({
    preheader: "Your order is heading your way.",
    title: "Out for delivery",
    badge: { label: "Delivery", tone: "delivery" },
    bodyHtml,
    variant: "customer",
  })

  return { subject, text, html }
}

export function buildCustomOrderUpdateEmail(
  ctx: CustomerOrderUpdateContext,
  subject: string,
  message: string
): EmailContent {
  const trimmedSubject = subject.trim() || "An update on your order"
  const trimmedMessage = message.trim()

  const text = [
    greeting(ctx),
    "",
    trimmedMessage,
    ctx.internalRef ? `\nOrder reference: ${ctx.internalRef}` : "",
    "",
    textSignoff(),
  ]
    .filter(Boolean)
    .join("\n")

  const bodyHtml = [
    htmlParagraph(`${greeting(ctx)}`),
    ...trimmedMessage
      .split(/\n{2,}|\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => htmlParagraph(p)),
    ctx.internalRef
      ? htmlParagraph(`Order reference: ${ctx.internalRef}`)
      : "",
  ].join("")

  const html = emailLayout({
    preheader: trimmedSubject,
    title: "Order update",
    badge: { label: "Update", tone: "neutral" },
    bodyHtml,
    variant: "customer",
  })

  return { subject: trimmedSubject, text, html }
}

export function defaultCustomEmailSubject(): string {
  return "An update on your order"
}

export function defaultCustomEmailMessage(ctx: CustomerOrderUpdateContext): string {
  const ref = ctx.internalRef ? ` (${ctx.internalRef})` : ""
  return [
    `Just a quick note about your order${ref}:`,
    "",
    "Add your message here before sending.",
  ].join("\n")
}

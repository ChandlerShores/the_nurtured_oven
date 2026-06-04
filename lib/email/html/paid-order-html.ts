import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import { formatDeliveryFeeConfirmationNote } from "@/lib/delivery/delivery-fee-policy"
import type { PaidOrderDetails } from "@/lib/order/paid-order-details"
import {
  formatCustomerPaidOrderBody,
  formatCustomerPaidOrderSubject,
  formatDeliveryBlock,
  formatMoney,
  formatOwnerPaidOrderBody,
  formatOwnerPaidOrderSubject,
  resolveBatchLabel,
} from "@/lib/email/paid-order-email"
import {
  emailLayout,
  escapeHtml,
  htmlButton,
  htmlKeyValue,
  htmlLineItems,
  htmlNote,
  htmlParagraph,
  htmlSection,
  htmlTotal,
} from "@/lib/email/html/layout"
import type { EmailContent } from "@/lib/email/types"

function menuLineItems(details: PaidOrderDetails) {
  return details.lineItems
    .filter((i) => i.type !== "delivery_fee")
    .map((i) => ({ name: i.name, quantity: i.quantity }))
}

export function buildCustomerPaidOrderEmail(
  details: PaidOrderDetails,
  replyToEmail: string
): EmailContent {
  const batch = resolveBatchLabel(details)
  const firstName =
    details.customerName?.trim().split(/\s+/)[0] || "there"
  const isDelivery = details.fulfillmentMethod === "delivery"
  const items = menuLineItems(details)

  let orderSection = htmlLineItems(items)
  if (details.deliveryFeeCents) {
    orderSection += htmlKeyValue(
      "Delivery",
      formatDeliveryFeeConfirmationNote({
        feeCents: details.deliveryFeeCents,
        subtotalCents: details.subtotalCents,
        deliveryCity: details.deliveryCity,
        deliveryZip: details.deliveryZip,
      })
    )
  } else if (isDelivery) {
    orderSection += htmlParagraph("Delivery included with your order.")
  }

  const fulfillmentInner = [
    htmlKeyValue("When", batch),
    htmlKeyValue(
      "How",
      isDelivery
        ? "Friday delivery (Georgetown or Lexington)"
        : "Friday pickup (free)"
    ),
    isDelivery && formatDeliveryBlock(details)
      ? htmlKeyValue("Deliver to", formatDeliveryBlock(details)!)
      : "",
    isDelivery
      ? htmlNote(
          "We deliver on Friday within our local window. Exact times are not guaranteed—we will be in touch if anything changes."
        )
      : htmlParagraph("We will follow up with pickup details closer to Friday."),
  ].join("")

  const bodyHtml = [
    htmlParagraph(
      `Hi ${firstName}, thank you for your order. Payment was received and your spot for ${batch} is confirmed.`
    ),
    htmlSection("Your order", orderSection + htmlTotal("Total paid", formatMoney(details.amountCents))),
    htmlSection("Fulfillment", fulfillmentInner),
    details.receiptUrl
      ? htmlButton(details.receiptUrl, "View receipt")
      : "",
    htmlNote(
      "Questions or need to change something? Reply to this email as soon as you can so we can help before bake day."
    ),
  ].join("")

  const html = emailLayout({
    preheader: `You're confirmed for ${batch}.`,
    title: "Your order is confirmed",
    badge: {
      label: isDelivery ? "Delivery" : "Pickup",
      tone: isDelivery ? "delivery" : "pickup",
    },
    bodyHtml,
    footerHtml: `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#7F8672;">Reply to this email (<a href="mailto:${escapeHtml(replyToEmail)}" style="color:#4A352C;">${escapeHtml(replyToEmail)}</a>) and we will get back to you promptly.</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#7F8672;">With care,<br><strong style="color:#4A352C;">The Nurtured Oven</strong></p>`,
    variant: "customer",
  })

  return {
    subject: formatCustomerPaidOrderSubject(details),
    text: formatCustomerPaidOrderBody(details, replyToEmail),
    html,
  }
}

export function buildOwnerPaidOrderEmail(
  details: PaidOrderDetails
): EmailContent {
  const batch = resolveBatchLabel(details)
  const isDelivery = details.fulfillmentMethod === "delivery"
  const methodLabel = isDelivery
    ? fulfillmentPolicy.deliveryOptionLabel
    : fulfillmentPolicy.pickupOptionLabel

  const items = details.lineItems.map((i) => ({
    name: i.name,
    quantity: i.quantity,
  }))

  const customerInner = [
    details.customerName
      ? htmlKeyValue("Name", details.customerName)
      : "",
    details.customerEmail
      ? htmlKeyValue("Email", details.customerEmail)
      : "",
    details.customerPhone
      ? htmlKeyValue("Phone", details.customerPhone)
      : "",
  ].join("")

  const orderInner =
    htmlLineItems(items) +
    htmlTotal("Total paid", formatMoney(details.amountCents))

  const extras: string[] = []
  if (isDelivery && formatDeliveryBlock(details)) {
    extras.push(htmlKeyValue("Delivery address", formatDeliveryBlock(details)!))
  }
  if (details.dietary?.trim()) {
    extras.push(htmlKeyValue("Dietary / allergies", details.dietary.trim()))
  }
  if (details.message?.trim()) {
    extras.push(htmlKeyValue("Customer message", details.message.trim()))
  }

  const metaInner = [
    details.internalRef
      ? htmlKeyValue("Reference", details.internalRef)
      : "",
    htmlKeyValue("Fulfillment date", batch),
    htmlKeyValue("Pickup / delivery", methodLabel),
    details.receiptUrl
      ? htmlButton(details.receiptUrl, "Open Square receipt")
      : "",
    details.squareOrderId
      ? htmlKeyValue("Square order", details.squareOrderId)
      : "",
  ].join("")

  const bodyHtml = [
    htmlSection("Order details", metaInner),
    htmlSection("Customer", customerInner),
    htmlSection("Items", orderInner),
    extras.length ? htmlSection("Notes & delivery", extras.join("")) : "",
    htmlNote("Customer confirmation email sent. Prep for Friday."),
  ].join("")

  const html = emailLayout({
    preheader: `${isDelivery ? "Delivery" : "Pickup"} · ${batch} · ${details.customerName ?? "Customer"}`,
    title: `Weekly order — ${batch}`,
    badge: {
      label: isDelivery ? "Delivery" : "Pickup",
      tone: isDelivery ? "delivery" : "pickup",
    },
    bodyHtml,
    footerHtml: `<p style="margin:0;font-size:12px;color:#7F8672;">Sent from The Nurtured Oven website.</p>`,
    variant: "owner",
  })

  return {
    subject: formatOwnerPaidOrderSubject(details),
    text: formatOwnerPaidOrderBody(details),
    html,
  }
}

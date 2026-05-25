/**
 * Write HTML email previews you can open in a browser.
 * Run: pnpm email:preview
 */
import { mkdirSync, writeFileSync } from "fs"
import { join } from "path"
import type { PaidOrderDetails } from "../lib/order/paid-order-details"
import { getEmailConfig } from "../lib/email/config"
import {
  buildInquiryCustomerEmail,
  buildInquiryOwnerEmail,
} from "../lib/email/html/inquiry-html"
import {
  buildCustomerPaidOrderEmail,
  buildOwnerPaidOrderEmail,
} from "../lib/email/html/paid-order-html"

const outDir = join(process.cwd(), "email-previews")

const paidSample: PaidOrderDetails = {
  internalRef: "TNO-2026-05-29-A8F3K2",
  fulfillmentMethod: "delivery",
  fulfillmentDate: "2026-05-29",
  batchLabel: "Friday 5/29",
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  customerPhone: "+1 (859) 555-1234",
  lineItems: [
    { name: "Weekly Comfort Box", quantity: 1, slug: "weekly-comfort-box" },
    { name: "Brown Butter Chocolate Chip Cookies (6-pack)", quantity: 1 },
    {
      name: "Friday delivery (Georgetown or Lexington)",
      quantity: 1,
      type: "delivery_fee",
    },
  ],
  deliveryCity: "Georgetown",
  deliveryAddress: "123 Main St",
  dietary: "No tree nuts",
  message: "Please text when you are on the way",
  amountCents: 5400,
  deliveryFeeCents: 700,
  squareOrderId: "order_example",
  receiptUrl: "https://squareup.com/receipt/example",
}

const giftInquiry = {
  intent: "gift" as const,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1 (859) 555-1234",
  items: "Comfort Box — $50",
  fulfillment: "delivery",
  deliveryCity: "Lexington",
  deliveryAddress: "456 Oak Ave",
  giftRecipient: "Sam",
  giftOccasion: "Birthday",
  dietary: "Gluten-aware if possible",
  message: "Please include a birthday note",
}

const replyTo = getEmailConfig().replyToEmail

const previews = [
  {
    file: "01-customer-paid-weekly.html",
    ...buildCustomerPaidOrderEmail(paidSample, replyTo),
  },
  {
    file: "02-owner-paid-weekly.html",
    ...buildOwnerPaidOrderEmail(paidSample),
  },
  {
    file: "03-customer-gift-inquiry.html",
    ...buildInquiryCustomerEmail(giftInquiry),
  },
  {
    file: "04-owner-gift-inquiry.html",
    ...buildInquiryOwnerEmail(giftInquiry),
  },
]

mkdirSync(outDir, { recursive: true })

for (const { file, subject, html } of previews) {
  const path = join(outDir, file)
  writeFileSync(path, html, "utf8")
  console.log(`Wrote ${path}`)
  console.log(`  Subject: ${subject}\n`)
}

console.log("Open any .html file in email-previews/ in your browser to see the styled email.")
console.log("(Plain-text versions are still sent as fallback for older inboxes.)\n")

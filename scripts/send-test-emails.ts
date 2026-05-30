/**
 * Send all email templates to a test inbox.
 * Run: node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/send-test-emails.ts [to@email.com]
 */
import type { PaidOrderDetails } from "../lib/order/paid-order-details"
import { getEmailConfig } from "../lib/email/config"
import { sendEmail } from "../lib/email/send"
import {
  buildInquiryCustomerEmail,
  buildInquiryOwnerEmail,
} from "../lib/email/html/inquiry-html"
import {
  buildCustomerPaidOrderEmail,
  buildOwnerPaidOrderEmail,
} from "../lib/email/html/paid-order-html"

const to = process.argv[2]?.trim() || "shores.chandler@gmail.com"
const config = getEmailConfig()

const inquiry = {
  intent: "gift" as const,
  name: "Jane Doe",
  email: to,
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

const paidOrder: PaidOrderDetails = {
  internalRef: "TNO-2026-05-29-TEST01",
  fulfillmentMethod: "delivery",
  fulfillmentDate: "2026-05-29",
  batchLabel: "Friday 5/29",
  customerName: "Jane Doe",
  customerEmail: to,
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
  squareOrderId: "order_test",
  receiptUrl: "https://squareup.com/receipt/example",
}

const templates = [
  {
    label: "Inquiry owner notification",
    ...buildInquiryOwnerEmail(inquiry),
    replyTo: to,
  },
  {
    label: "Inquiry customer auto-reply",
    ...buildInquiryCustomerEmail(inquiry),
    replyTo: config.replyToEmail,
  },
  {
    label: "Paid order owner notification",
    ...buildOwnerPaidOrderEmail(paidOrder),
    replyTo: to,
  },
  {
    label: "Paid order customer confirmation",
    ...buildCustomerPaidOrderEmail(paidOrder, config.replyToEmail),
    replyTo: config.replyToEmail,
  },
]

async function main() {
  console.log(`\nSending ${templates.length} test emails to ${to}`)
  console.log(`From: ${config.fromName} <${config.fromAddress}>`)
  console.log(`Reply-to: ${config.replyToEmail}\n`)

  let failed = 0

  for (const { label, subject, text, html, replyTo } of templates) {
    const result = await sendEmail({
      to: [to],
      subject: `[TEST] ${subject}`,
      text,
      html,
      replyTo,
    })

    if (result.success && !result.skipped) {
      console.log(`✓ ${label}`)
    } else if (result.skipped) {
      console.error(`✗ ${label} — skipped (RESEND_API_KEY not set)`)
      failed++
    } else {
      console.error(`✗ ${label} — ${result.error}`)
      failed++
    }
  }

  console.log(failed === 0 ? "\nAll emails sent.\n" : `\n${failed} failed.\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main()

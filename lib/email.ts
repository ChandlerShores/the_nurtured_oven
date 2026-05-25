import type { PaidOrderDetails } from "@/lib/order/paid-order-details"
import { getEmailConfig } from "@/lib/email/config"
import {
  shouldSendInquiryCustomerReply,
  type InquiryEmailData,
} from "@/lib/email/inquiry-email"
import { buildInquiryCustomerEmail, buildInquiryOwnerEmail } from "@/lib/email/html/inquiry-html"
import {
  buildCustomerPaidOrderEmail,
  buildOwnerPaidOrderEmail,
} from "@/lib/email/html/paid-order-html"
import { sendEmail } from "@/lib/email/send"

export type { InquiryEmailData } from "@/lib/email/inquiry-email"

export async function sendInquiryEmail(
  data: InquiryEmailData,
  ownerEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig()
  const toOwner = ownerEmail ?? config.ownerEmail

  const owner = buildInquiryOwnerEmail(data)
  const ownerResult = await sendEmail({
    to: [toOwner],
    subject: owner.subject,
    text: owner.text,
    html: owner.html,
    replyTo: data.email,
  })

  if (!ownerResult.success) {
    return ownerResult
  }

  if (shouldSendInquiryCustomerReply(data.intent)) {
    const customer = buildInquiryCustomerEmail(data)
    const customerResult = await sendEmail({
      to: [data.email],
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
      replyTo: config.replyToEmail,
    })

    if (!customerResult.success) {
      return customerResult
    }
  }

  return { success: true }
}

export async function sendPaidOrderEmails(
  data: PaidOrderDetails,
  ownerEmail?: string
): Promise<void> {
  const config = getEmailConfig()
  const toOwner = ownerEmail ?? config.ownerEmail

  const owner = buildOwnerPaidOrderEmail(data)
  await sendEmail({
    to: [toOwner],
    subject: owner.subject,
    text: owner.text,
    html: owner.html,
    replyTo: data.customerEmail,
  })

  if (data.customerEmail) {
    const customer = buildCustomerPaidOrderEmail(data, config.replyToEmail)
    await sendEmail({
      to: [data.customerEmail],
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
      replyTo: config.replyToEmail,
    })
  }
}

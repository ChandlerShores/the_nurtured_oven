import type { PaidOrderDetails } from "@/lib/order/paid-order-details"
import { getDeploymentTier } from "@/lib/env/deployment"
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
import { sendEmail, type SendEmailResult } from "@/lib/email/send"

export type { InquiryEmailData } from "@/lib/email/inquiry-email"

function assertEmailDelivered(result: SendEmailResult, context: string): void {
  if (result.skipped && getDeploymentTier() === "production") {
    throw new Error(
      `Email not configured in production (${context}). Set RESEND_API_KEY.`
    )
  }
  if (!result.success) {
    throw new Error(result.error ?? `Failed to send ${context}`)
  }
}

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
  if (ownerResult.skipped && getDeploymentTier() === "production") {
    return {
      success: false,
      error: "Email is not configured. Set RESEND_API_KEY.",
    }
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
    if (customerResult.skipped && getDeploymentTier() === "production") {
      return {
        success: false,
        error: "Email is not configured. Set RESEND_API_KEY.",
      }
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
  assertEmailDelivered(
    await sendEmail({
      to: [toOwner],
      subject: owner.subject,
      text: owner.text,
      html: owner.html,
      replyTo: data.customerEmail,
    }),
    "owner paid-order notification"
  )

  if (data.customerEmail) {
    const customer = buildCustomerPaidOrderEmail(data, config.replyToEmail)
    assertEmailDelivered(
      await sendEmail({
        to: [data.customerEmail],
        subject: customer.subject,
        text: customer.text,
        html: customer.html,
        replyTo: config.replyToEmail,
      }),
      "customer paid-order confirmation"
    )
  }
}

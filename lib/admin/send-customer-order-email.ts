import {
  customerEmailTypeLabel,
  type CustomerEmailType,
} from "@/lib/admin/customer-email-types"
import { validateOrderForCustomerEmail } from "@/lib/admin/customer-order-email-validation"
import {
  buildCustomOrderUpdateEmail,
  buildOutForDeliveryEmail,
  buildReadyForPickupEmail,
  type CustomerOrderUpdateContext,
} from "@/lib/email/customer-order-update"
import { sendEmail } from "@/lib/email/send"
import { appendCustomerEmailLog } from "@/lib/google-sheets/customer-emails"
import { isDeliveryOrder } from "@/lib/delivery/delivery-orders"
import { findOrderByInternalRef } from "@/lib/google-sheets/orders"
import { isPickupOrder } from "@/lib/pickup/pickup-orders"

function buildEmailContent(
  type: CustomerEmailType,
  ctx: CustomerOrderUpdateContext,
  custom?: { subject: string; message: string }
) {
  switch (type) {
    case "ready_pickup":
      return buildReadyForPickupEmail(ctx)
    case "out_for_delivery":
      return buildOutForDeliveryEmail(ctx)
    case "custom":
      return buildCustomOrderUpdateEmail(
        ctx,
        custom?.subject ?? "",
        custom?.message ?? ""
      )
  }
}

export interface SendCustomerOrderEmailInput {
  internalRef: string
  type: CustomerEmailType
  customSubject?: string
  customMessage?: string
}

export interface SendCustomerOrderEmailResult {
  ok: boolean
  error?: string
  skipped?: boolean
  messageId?: string
  subject?: string
}

export async function sendCustomerOrderEmail(
  input: SendCustomerOrderEmailInput
): Promise<SendCustomerOrderEmailResult> {
  const internalRef = input.internalRef.trim()
  if (!internalRef) {
    return { ok: false, error: "Order reference is required." }
  }

  const order = await findOrderByInternalRef(internalRef)
  if (!order) {
    return { ok: false, error: "Order not found." }
  }

  const validationError = validateOrderForCustomerEmail(order)
  if (validationError) {
    return { ok: false, error: validationError }
  }

  if (input.type === "ready_pickup" && !isPickupOrder(order)) {
    return {
      ok: false,
      error: "Ready for Pickup is only for pickup orders.",
    }
  }

  if (input.type === "out_for_delivery" && !isDeliveryOrder(order)) {
    return {
      ok: false,
      error: "Out for Delivery is only for delivery orders.",
    }
  }

  if (input.type === "custom") {
    const subject = input.customSubject?.trim() ?? ""
    const message = input.customMessage?.trim() ?? ""
    if (!subject || !message) {
      return { ok: false, error: "Subject and message are required." }
    }
    if (message.length > 4000) {
      return { ok: false, error: "Message is too long (max 4000 characters)." }
    }
  }

  const ctx: CustomerOrderUpdateContext = {
    customerName: order.customerName,
    internalRef: order.internalRef,
  }

  const content = buildEmailContent(input.type, ctx, {
    subject: input.customSubject ?? "",
    message: input.customMessage ?? "",
  })

  const sendResult = await sendEmail({
    to: [order.customerEmail.trim()],
    subject: content.subject,
    text: content.text,
    html: content.html,
  })

  const sentStatus = sendResult.skipped
    ? "Skipped (Resend not configured)"
    : sendResult.success
      ? "Sent"
      : `Failed: ${sendResult.error ?? "Unknown error"}`

  try {
    await appendCustomerEmailLog({
      internalRef: order.internalRef,
      squareOrderId: order.squareOrderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      emailType: input.type,
      subject: content.subject,
      message:
        input.type === "custom"
          ? (input.customMessage?.trim() ?? "")
          : content.text.split("\n").slice(1, 6).join("\n").trim(),
      sentStatus,
      resendMessageId: sendResult.messageId ?? "",
    })
  } catch (err) {
    console.error("[admin] customer email log append failed", err)
  }

  if (!sendResult.success && !sendResult.skipped) {
    return { ok: false, error: sendResult.error ?? "Could not send email." }
  }

  return {
    ok: true,
    skipped: sendResult.skipped,
    messageId: sendResult.messageId,
    subject: content.subject,
  }
}

export { customerEmailTypeLabel }

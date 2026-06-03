import type { CustomerEmailType } from "@/lib/admin/customer-email-types"
import { validateOrderForCustomerEmail } from "@/lib/admin/customer-order-email-validation"
import {
  buildCustomOrderUpdateEmail,
  buildOutForDeliveryEmail,
  buildReadyForPickupEmail,
  type CustomerOrderUpdateContext,
} from "@/lib/email/customer-order-update"
import type { AdminOrderRow } from "@/lib/google-sheets/orders"
// AdminOrderRow is type-only — do not import server Sheets code in client bundles.

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

export function previewCustomerOrderEmail(
  order: AdminOrderRow,
  type: CustomerEmailType,
  custom?: { subject: string; message: string }
): { subject: string; text: string } | { error: string } {
  const validationError = validateOrderForCustomerEmail(order)
  if (validationError) return { error: validationError }

  const ctx: CustomerOrderUpdateContext = {
    customerName: order.customerName,
    internalRef: order.internalRef,
  }

  const content = buildEmailContent(type, ctx, custom)
  return { subject: content.subject, text: content.text }
}

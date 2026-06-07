import type { SopWorkflow } from "../types"

export const pickupOrdersWorkflow: SopWorkflow = {
  slug: "pickup-orders",
  title: "Manage pickup orders",
  ownerFacingTitle: "How to manage pickup orders",
  purpose:
    "Help Kori keep pickup orders organized on bake day and mark them as customers collect them.",
  whenToUse: [
    "Use this on pickup day.",
    "Use this when orders are packed and ready for customers.",
    "Use this when a customer picks up an order.",
  ],
  prerequisites: [
    "Kori can log in to the admin area.",
    "Paid pickup orders are visible for the week.",
    "Packed orders are ready to be checked against the pickup list.",
  ],
  steps: [
    {
      id: "open-pickup",
      title: "Open Pickup",
      ownerInstruction:
        "Open Pickup in the admin area. This is the working list for customer pickups.",
      route: "adminPickup",
      dataSop: "admin-pickup-page",
      highlightDataSop: "admin-pickup-page",
      captureMode: "viewport",
      screenshotName: "01-pickup-queue.png",
      expectedResult: "You can see the pickup overview and queue.",
    },
    {
      id: "review-overview",
      title: "Review the overview",
      ownerInstruction:
        "Check the overview so you know how many pickup orders are waiting or ready.",
      route: "adminPickup",
      dataSop: "pickup-overview",
      highlightDataSop: "pickup-overview",
      captureMode: "element-with-context",
      screenshotName: "02-pickup-overview.png",
      expectedResult: "You know how many pickup orders need attention.",
    },
    {
      id: "notify-ready-orders",
      title: "Send pickup notes if used",
      ownerInstruction:
        "Use Notify when pickup orders are marked Ready and customers should know they can come by.",
      route: "adminPickup",
      dataSop: "pickup-notify",
      highlightDataSop: "pickup-notify",
      captureMode: "element-with-context",
      screenshotName: "03-pickup-notify.png",
      expectedResult: "Customers with ready pickup orders can be notified.",
    },
    {
      id: "work-through-queue",
      title: "Work through the queue",
      ownerInstruction:
        "Use the queue to check each customer's items, notes, and status.",
      route: "adminPickup",
      dataSop: "pickup-queue",
      highlightDataSop: "pickup-queue",
      captureMode: "element-with-context",
      screenshotName: "04-pickup-order-card.png",
      expectedResult: "Each pickup order is easy to check before handing it off.",
    },
    {
      id: "mark-picked-up",
      title: "Mark picked up",
      ownerInstruction:
        "Click Picked up after the customer has their order.",
      route: "adminPickup",
      dataSop: "pickup-picked-up-button",
      highlightDataSop: "pickup-picked-up-button",
      captureMode: "element-with-context",
      screenshotName: "05-mark-picked-up.png",
      expectedResult: "The order moves out of the active pickup queue.",
    },
  ],
  successCheck: [
    "Ready pickup orders are clear.",
    "Picked up orders are marked when customers collect them.",
    "Any confusing order is left unchanged until Kori can check it.",
  ],
  commonMistakes: [
    "Marking an order picked up before the customer receives it.",
    "Sending pickup notes before orders are actually ready.",
    "Missing a dietary note or customer message.",
  ],
  troubleshooting: [
    "If a customer arrives early, check the queue before handing off.",
    "If an order is missing, do not mark it picked up.",
    "If Kori is unsure, open the order details or ask Chandler for help.",
  ],
  relatedWorkflows: ["review-paid-orders", "customer-updates"],
  riskLevel: "medium",
  recommendedTrainingFormat: "guided walkthrough",
}

import type { SopWorkflow } from "../types"

export const reviewPaidOrdersWorkflow: SopWorkflow = {
  slug: "review-paid-orders",
  title: "Review paid orders",
  ownerFacingTitle: "How to review paid orders",
  purpose:
    "Help Kori see what customers have already paid for before baking or packing.",
  whenToUse: [
    "Use this while ordering is open to keep an eye on new orders.",
    "Use this before prep day.",
    "Use this before bake day so the bake list feels clear.",
  ],
  prerequisites: [
    "Kori can log in to the admin area.",
    "Orders have come in through the website.",
    "Kori has a quiet moment to review names, items, and notes.",
  ],
  steps: [
    {
      id: "open-orders",
      title: "Open Orders",
      ownerInstruction:
        "Open Orders in the admin area. This is where paid website orders are reviewed.",
      route: "adminOrders",
      dataSop: "admin-orders-page",
      highlightDataSop: "admin-orders-page",
      captureMode: "viewport",
      screenshotName: "01-orders-dashboard.png",
      expectedResult: "You can see this week's order list.",
    },
    {
      id: "check-new-orders",
      title: "Check new orders",
      ownerInstruction:
        "Check any New orders first. These are the orders that still need your first review.",
      route: "adminOrders",
      dataSop: "orders-new-review-card",
      highlightDataSop: "orders-new-review-card",
      captureMode: "element-with-context",
      screenshotName: "02-new-orders.png",
      expectedResult: "You know which orders still need attention.",
    },
    {
      id: "review-order-list",
      title: "Review the list",
      ownerInstruction:
        "Check the customer name, items, pickup or delivery choice, and status.",
      route: "adminOrders",
      dataSop: "orders-table",
      highlightDataSop: "orders-table",
      captureMode: "element-with-context",
      screenshotName: "03-order-list.png",
      expectedResult: "The orders look ready to use for baking and planning.",
    },
    {
      id: "open-order-if-needed",
      title: "Open an order if needed",
      ownerInstruction:
        "Click Open when you need more detail for one customer.",
      route: "adminOrders",
      dataSop: "order-open",
      highlightDataSop: "order-open",
      captureMode: "element-with-context",
      screenshotName: "04-open-order.png",
      expectedResult: "You can review the full order before making changes.",
    },
  ],
  successCheck: [
    "New orders have been reviewed.",
    "Any order with a note or issue is easy to find again.",
    "Kori knows what needs to be baked, packed, picked up, or delivered.",
  ],
  commonMistakes: [
    "Changing a status too quickly before reading the order.",
    "Missing a customer note.",
    "Forgetting to check pickup and delivery choices.",
  ],
  troubleshooting: [
    "If an order looks confusing, leave it alone and ask for help.",
    "If a customer says they paid but the order is missing, check the emergency guide.",
    "If too many orders are coming in, close ordering before reviewing more.",
  ],
  relatedWorkflows: ["pickup-orders", "delivery-orders", "customer-updates"],
  riskLevel: "medium",
  recommendedTrainingFormat: "guided walkthrough",
}

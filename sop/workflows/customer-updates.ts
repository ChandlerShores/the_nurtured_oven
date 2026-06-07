import type { SopWorkflow } from "../types"

export const customerUpdatesWorkflow: SopWorkflow = {
  slug: "customer-updates",
  title: "Send customer updates",
  ownerFacingTitle: "How to send customer updates",
  purpose:
    "Help Kori send short, helpful updates to customers when an order is ready, out for delivery, or needs a personal note.",
  whenToUse: [
    "Use this when a pickup order is ready.",
    "Use this when delivery orders are heading out.",
    "Use this when one customer needs a clear update.",
  ],
  prerequisites: [
    "Kori can log in to the admin area.",
    "The order is paid and has a customer email.",
    "Kori knows what the customer needs to hear.",
  ],
  steps: [
    {
      id: "open-messages",
      title: "Open Messages",
      ownerInstruction:
        "Open Messages in the admin area. This is where customer notes can be sent and reviewed.",
      route: "adminMessages",
      dataSop: "admin-messages-page",
      highlightDataSop: "admin-messages-page",
      captureMode: "viewport",
      screenshotName: "01-messages-page.png",
      expectedResult: "You can see the message overview, send area, and log.",
    },
    {
      id: "choose-order",
      title: "Choose the order",
      ownerInstruction:
        "Search for the customer or order, then choose the right one before writing or sending.",
      route: "adminMessages",
      dataSop: "customer-updates-order-search",
      highlightDataSop: "customer-updates-order-search",
      captureMode: "element-with-context",
      screenshotName: "02-choose-order.png",
      expectedResult: "The correct order is selected.",
    },
    {
      id: "send-update",
      title: "Choose the update type",
      ownerInstruction:
        "Choose the update type that matches the situation. The app will show a preview before you send.",
      route: "adminMessages",
      dataSop: "customer-updates-composer",
      highlightDataSop: "customer-updates-composer",
      captureMode: "element-with-context",
      screenshotName: "03-send-update.png",
      expectedResult: "You can see the update choices for the selected order.",
    },
    {
      id: "check-message-log",
      title: "Check the message log",
      ownerInstruction:
        "Check the log after sending so you know what has already gone out.",
      route: "adminMessages",
      dataSop: "messages-log",
      highlightDataSop: "messages-log",
      captureMode: "element-with-context",
      screenshotName: "04-message-log.png",
      expectedResult: "You can see recent customer updates.",
    },
  ],
  successCheck: [
    "The right customer was selected.",
    "The message is short and clear.",
    "The log shows what was sent.",
  ],
  commonMistakes: [
    "Choosing the wrong customer.",
    "Sending a message before the order is actually ready.",
    "Writing too much when a short note would be clearer.",
  ],
  troubleshooting: [
    "If the order does not appear, check that it has a customer email.",
    "If Kori is unsure what to say, pause and ask Chandler.",
    "If a message fails, use the customer's phone or email outside the app and ask for help.",
  ],
  relatedWorkflows: ["pickup-orders", "delivery-orders", "review-paid-orders"],
  riskLevel: "medium",
  recommendedTrainingFormat: "guided walkthrough",
}

import type { SopWorkflow } from "../types"

export const deliveryOrdersWorkflow: SopWorkflow = {
  slug: "delivery-orders",
  title: "Manage delivery orders",
  ownerFacingTitle: "How to manage delivery orders",
  purpose:
    "Help Kori review delivery orders, plan the delivery path, and mark deliveries complete.",
  whenToUse: [
    "Use this before leaving for deliveries.",
    "Use this when checking addresses and delivery notes.",
    "Use this after each delivery is complete.",
  ],
  prerequisites: [
    "Kori can log in to the admin area.",
    "Paid delivery orders are visible for the week.",
    "Orders are packed before leaving for deliveries.",
  ],
  steps: [
    {
      id: "open-deliveries",
      title: "Open Deliveries",
      ownerInstruction:
        "Open Deliveries in the admin area. This is the working list for the delivery path.",
      route: "adminDeliveries",
      dataSop: "admin-deliveries-page",
      highlightDataSop: "admin-deliveries-page",
      captureMode: "viewport",
      screenshotName: "01-delivery-dashboard.png",
      expectedResult: "You can see the delivery overview and delivery plan.",
    },
    {
      id: "check-delivery-overview",
      title: "Check the overview",
      ownerInstruction:
        "Check the overview so you know how many deliveries are still active.",
      route: "adminDeliveries",
      dataSop: "delivery-overview",
      highlightDataSop: "delivery-overview",
      captureMode: "element-with-context",
      screenshotName: "02-delivery-overview.png",
      expectedResult: "You know how many delivery orders need attention.",
    },
    {
      id: "send-delivery-notes",
      title: "Send delivery notes if used",
      ownerInstruction:
        "Use Notify customers when delivery orders are ready and customers should know you are heading out.",
      route: "adminDeliveries",
      dataSop: "delivery-notify",
      highlightDataSop: "delivery-notify",
      captureMode: "element-with-context",
      screenshotName: "03-delivery-notify.png",
      expectedResult: "Customers can be told their orders are on the way.",
    },
    {
      id: "plan-delivery-path",
      title: "Plan the delivery path",
      ownerInstruction:
        "Use the delivery plan to check stops, addresses, and the map link before leaving.",
      route: "adminDeliveries",
      dataSop: "delivery-route-builder",
      highlightDataSop: "delivery-route-builder",
      captureMode: "element-with-context",
      screenshotName: "04-delivery-path.png",
      expectedResult: "The delivery stops are clear before Kori leaves.",
    },
    {
      id: "mark-delivered",
      title: "Mark delivered",
      ownerInstruction:
        "Click Mark delivered after the order has been dropped off.",
      route: "adminDeliveries",
      dataSop: "delivery-mark-delivered",
      highlightDataSop: "delivery-mark-delivered",
      captureMode: "element-with-context",
      screenshotName: "05-mark-delivered.png",
      expectedResult: "The order moves out of the active delivery list.",
    },
  ],
  successCheck: [
    "Addresses are checked before leaving.",
    "Any missing address is handled before delivery.",
    "Delivered orders are marked only after drop-off.",
  ],
  commonMistakes: [
    "Leaving before checking for missing addresses.",
    "Marking delivered before the order is dropped off.",
    "Forgetting to check the customer phone number when there is an issue.",
  ],
  troubleshooting: [
    "If an address is missing, contact the customer before leaving.",
    "If a stop looks wrong, do not mark it delivered yet.",
    "If the delivery path feels confusing, pause and ask for help before driving.",
  ],
  relatedWorkflows: ["review-paid-orders", "customer-updates"],
  riskLevel: "medium",
  recommendedTrainingFormat: "guided walkthrough",
}

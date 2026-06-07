import type { SopWorkflow } from "../types"

export const openCloseOrderingWorkflow: SopWorkflow = {
  slug: "open-close-ordering",
  title: "Open or close ordering",
  ownerFacingTitle: "How to open or close ordering",
  purpose:
    "Help Kori open ordering when the menu is ready and pause ordering when she needs a little breathing room.",
  whenToUse: [
    "Use this before customers order for a new week.",
    "Use this when the menu looks wrong or an item needs attention.",
    "Use this when Kori is sold out, overwhelmed, or unsure.",
  ],
  prerequisites: [
    "Kori can log in to the admin area.",
    "The weekly menu has been checked.",
    "Kori knows whether customers should be able to order right now.",
  ],
  steps: [
    {
      id: "open-admin-notes",
      title: "Open Admin notes and check ordering",
      ownerInstruction:
        "Open Admin notes and check the ordering status before changing anything.",
      route: "adminSettings",
      dataSop: "ordering-status-card",
      highlightDataSop: "ordering-status-card",
      captureMode: "element-with-context",
      screenshotName: "01-ordering-status.png",
      expectedResult: "You know whether customers can order right now.",
    },
    {
      id: "open-or-close",
      title: "Open or close ordering",
      ownerInstruction:
        "Click the ordering button only when you are ready. If you are unsure, closing ordering is the safest choice.",
      route: "adminSettings",
      dataSop: "ordering-toggle",
      highlightDataSop: "ordering-toggle",
      captureMode: "element-with-context",
      screenshotName: "03-ordering-toggle.png",
      expectedResult:
        "The status changes so customers can order, or cannot order, as needed.",
    },
    {
      id: "check-public-menu",
      title: "Check the public menu",
      ownerInstruction:
        "Open the public menu and check what customers see after the change.",
      route: "publicMenu",
      dataSop: "public-menu-page",
      highlightDataSop: "public-menu-page",
      captureMode: "page",
      screenshotName: "04-check-public-menu.png",
      expectedResult: "The public menu matches the ordering choice you made.",
    },
  ],
  successCheck: [
    "The ordering status matches what Kori wants right now.",
    "The public menu looks correct.",
    "Ordering is closed if anything still feels uncertain.",
  ],
  commonMistakes: [
    "Opening ordering before checking the public menu.",
    "Forgetting to close ordering when the menu is still changing.",
    "Changing sold-out items when the full ordering switch is the safer choice.",
  ],
  troubleshooting: [
    "If the menu looks wrong, close ordering first.",
    "If customers should not order yet, keep ordering closed.",
    "If the button does not respond, stop and ask Chandler for help.",
  ],
  relatedWorkflows: ["update-weekly-menu", "emergency-ordering-shutoff"],
  riskLevel: "high",
  recommendedTrainingFormat: "guided walkthrough",
}

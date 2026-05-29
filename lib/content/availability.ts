import { getClosedNote } from "@/lib/content/launch"

export const availability = {
  /** Site banner when the weekly ordering window is open (Fri 9 AM – Wed noon ET). */
  cutoffDay: "Wednesday",
  cutoffTime: "noon",
  fulfillmentDay: "Friday",
  menuDropDay: "Friday",
  localDeliveryAvailable: true,
  serviceAreaLabel: "Georgetown & Lexington",
  openNote:
    "Order by Wednesday at noon for free Friday pickup or local delivery in Georgetown & Lexington.",
  /** Resolved from launch flags — see getClosedNote() in lib/content/launch.ts */
  closedNote: getClosedNote(),
}

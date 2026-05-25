import { availability } from "@/lib/content/availability"
import {
  isWeeklyOrderingWindowOpen,
  WEEKLY_ORDERING_CLOSED_MESSAGE,
} from "@/lib/menu/schedule"

/** Truthy: 1, true, yes (case-insensitive). Works in production unlike ORDERING_TEST_* vars. */
export function isOrderingKillSwitchActive(): boolean {
  const value = process.env.WEEKLY_ORDERING_DISABLED?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

export function isWeeklyOrderingAccepted(now: Date = new Date()): boolean {
  if (isOrderingKillSwitchActive()) return false
  return isWeeklyOrderingWindowOpen(now)
}

export function getOrderingClosedMessage(): string {
  if (isOrderingKillSwitchActive()) {
    return availability.closedNote
  }
  return WEEKLY_ORDERING_CLOSED_MESSAGE
}

export function getOrderingPublicState(now: Date = new Date()) {
  const killSwitch = isOrderingKillSwitchActive()
  const isOpen = isWeeklyOrderingAccepted(now)

  return {
    isOpen,
    bannerNote: isOpen
      ? availability.openNote
      : killSwitch
        ? availability.closedNote
        : "",
    weeklyOrderIntentAvailable: isOpen,
    closedMessage: isOpen ? "" : availability.closedNote,
  }
}

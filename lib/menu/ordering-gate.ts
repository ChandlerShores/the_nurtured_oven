import { availability } from "@/lib/content/availability"
import { resolveOrderingKillSwitchActive } from "@/lib/admin/ordering-kill-switch"
import { COMING_SOON_COPY } from "@/lib/content/coming-soon"
import { isComingSoonMode } from "@/lib/server/coming-soon-mode"
import {
  isWeeklyOrderingWindowOpen,
  WEEKLY_ORDERING_CLOSED_MESSAGE,
} from "@/lib/menu/schedule"

/** Truthy: 1, true, yes (case-insensitive). Env-only; use resolveOrderingKillSwitchActive() for full state. */
export function isEnvOrderingKillSwitchActive(): boolean {
  const value = process.env.WEEKLY_ORDERING_DISABLED?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

/** @deprecated Prefer isEnvOrderingKillSwitchActive or resolveOrderingKillSwitchActive */
export function isOrderingKillSwitchActive(): boolean {
  return isEnvOrderingKillSwitchActive()
}

export async function isWeeklyOrderingAcceptedAsync(
  now: Date = new Date()
): Promise<boolean> {
  if (isComingSoonMode()) return false
  if (await resolveOrderingKillSwitchActive()) return false
  return isWeeklyOrderingWindowOpen(now)
}

export function isWeeklyOrderingAccepted(now: Date = new Date()): boolean {
  if (isComingSoonMode()) return false
  if (isEnvOrderingKillSwitchActive()) return false
  return isWeeklyOrderingWindowOpen(now)
}

export async function getOrderingClosedMessageAsync(): Promise<string> {
  if (isComingSoonMode()) {
    return COMING_SOON_COPY.checkoutMessage
  }
  if (await resolveOrderingKillSwitchActive()) {
    return availability.closedNote
  }
  return WEEKLY_ORDERING_CLOSED_MESSAGE
}

export function getOrderingClosedMessage(): string {
  if (isComingSoonMode()) {
    return COMING_SOON_COPY.checkoutMessage
  }
  if (isEnvOrderingKillSwitchActive()) {
    return availability.closedNote
  }
  return WEEKLY_ORDERING_CLOSED_MESSAGE
}

export async function getOrderingPublicStateAsync(now: Date = new Date()) {
  const comingSoon = isComingSoonMode()
  const killSwitch = await resolveOrderingKillSwitchActive()
  const isOpen = comingSoon || killSwitch ? false : isWeeklyOrderingWindowOpen(now)
  const closedMessage = comingSoon
    ? COMING_SOON_COPY.checkoutMessage
    : availability.closedNote

  return {
    isOpen,
    bannerNote: isOpen
      ? availability.openNote
      : comingSoon
        ? COMING_SOON_COPY.shortBody
        : killSwitch
          ? availability.closedNote
          : "",
    weeklyOrderIntentAvailable: isOpen,
    closedMessage: isOpen ? "" : closedMessage,
    comingSoon,
  }
}

export function getOrderingPublicState(now: Date = new Date()) {
  const comingSoon = isComingSoonMode()
  const killSwitch = isEnvOrderingKillSwitchActive()
  const isOpen = comingSoon ? false : isWeeklyOrderingAccepted(now)
  const closedMessage = comingSoon
    ? COMING_SOON_COPY.checkoutMessage
    : availability.closedNote

  return {
    isOpen,
    bannerNote: isOpen
      ? availability.openNote
      : comingSoon
        ? COMING_SOON_COPY.shortBody
        : killSwitch
          ? availability.closedNote
          : "",
    weeklyOrderIntentAvailable: isOpen,
    closedMessage: isOpen ? "" : closedMessage,
    comingSoon,
  }
}

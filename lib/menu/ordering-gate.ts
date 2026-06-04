import { availability } from "@/lib/content/availability"
import { resolveOrderingKillSwitchActive } from "@/lib/admin/ordering-kill-switch"
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
  if (await resolveOrderingKillSwitchActive()) return false
  return isWeeklyOrderingWindowOpen(now)
}

export function isWeeklyOrderingAccepted(now: Date = new Date()): boolean {
  if (isEnvOrderingKillSwitchActive()) return false
  return isWeeklyOrderingWindowOpen(now)
}

export async function getOrderingClosedMessageAsync(): Promise<string> {
  if (await resolveOrderingKillSwitchActive()) {
    return availability.closedNote
  }
  return WEEKLY_ORDERING_CLOSED_MESSAGE
}

export function getOrderingClosedMessage(): string {
  if (isEnvOrderingKillSwitchActive()) {
    return availability.closedNote
  }
  return WEEKLY_ORDERING_CLOSED_MESSAGE
}

export async function getOrderingPublicStateAsync(now: Date = new Date()) {
  const killSwitch = await resolveOrderingKillSwitchActive()
  const isOpen = killSwitch ? false : isWeeklyOrderingWindowOpen(now)

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

export function getOrderingPublicState(now: Date = new Date()) {
  const killSwitch = isEnvOrderingKillSwitchActive()
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

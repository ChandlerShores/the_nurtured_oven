import {
  checkRateLimit,
  clearRateLimit,
  delayRateLimitedResponse,
  getClientIpFromRequest,
  recordRateLimitFailure,
} from "@/lib/security/rate-limit"

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 8

export function getLoginClientKey(request: Request): string {
  return getClientIpFromRequest(request)
}

export function checkLoginRateLimit(clientKey: string) {
  return checkRateLimit(clientKey, {
    windowMs: LOGIN_WINDOW_MS,
    maxAttempts: LOGIN_MAX_ATTEMPTS,
  })
}

export function recordFailedLoginAttempt(clientKey: string): void {
  recordRateLimitFailure(clientKey, { windowMs: LOGIN_WINDOW_MS })
}

export function clearLoginAttempts(clientKey: string): void {
  clearRateLimit(clientKey)
}

export async function delayFailedLoginResponse(): Promise<void> {
  await delayRateLimitedResponse(600)
}

import {
  clearRateLimitAsync,
  consumeRateLimitAsync,
  delayRateLimitedResponse,
  getClientIpFromRequest,
} from "@/lib/security/rate-limit"

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 8

export function getLoginClientKey(request: Request): string {
  return getClientIpFromRequest(request)
}

export async function consumeLoginRateLimitAsync(clientKey: string) {
  return consumeRateLimitAsync(clientKey, {
    windowMs: LOGIN_WINDOW_MS,
    maxAttempts: LOGIN_MAX_ATTEMPTS,
  })
}

export async function clearLoginAttemptsAsync(clientKey: string): Promise<void> {
  await clearRateLimitAsync(clientKey)
}

export async function delayFailedLoginResponse(): Promise<void> {
  await delayRateLimitedResponse(600)
}

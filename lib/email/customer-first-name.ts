/** First name for a warm greeting, or a neutral fallback. */
export function customerFirstName(
  customerName: string | undefined,
  fallback = "there"
): string {
  const first = customerName?.trim().split(/\s+/)[0]
  return first && first.length > 0 ? first : fallback
}

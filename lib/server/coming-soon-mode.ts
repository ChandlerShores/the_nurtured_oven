export function isComingSoonMode(): boolean {
  const value = process.env.COMING_SOON_MODE?.trim().toLowerCase()
  return value === "true"
}

/** Rough pack-size hint for production and print bake lists. */
export function packSizeForItem(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes("cookie")) return "6-pack / per sheet note"
  if (lower.includes("brownie") || lower.includes("bar"))
    return "4-pack / per sheet note"
  if (lower.includes("box")) return "Boxed set"
  return "See menu notes"
}

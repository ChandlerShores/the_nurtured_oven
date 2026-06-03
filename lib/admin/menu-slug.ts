/** URL-safe menu item id from a display name. */
export function slugifyMenuName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidMenuSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length >= 2 && slug.length <= 64
}

export function normalizeMenuSlug(input: string, fallbackName?: string): string {
  const trimmed = input.trim().toLowerCase()
  if (trimmed && isValidMenuSlug(trimmed)) return trimmed
  const fromName = fallbackName ? slugifyMenuName(fallbackName) : ""
  return fromName && isValidMenuSlug(fromName) ? fromName : ""
}

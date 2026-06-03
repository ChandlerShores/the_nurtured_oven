/** Only allow in-app admin redirects after login (blocks open redirects). */
export function safeAdminNextPath(raw: string | null | undefined): string {
  const path = raw?.trim() ?? ""
  if (!path.startsWith("/admin")) return "/admin"
  if (path.includes("://") || path.startsWith("//") || path.includes("\\")) {
    return "/admin"
  }
  return path
}

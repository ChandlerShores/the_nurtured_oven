/** Only allow in-app admin redirects after login (blocks open redirects). */
export function safeAdminNextPath(raw: string | null | undefined): string {
  const path = raw?.trim() ?? ""
  if (!path.startsWith("/admin")) return "/admin"
  if (path.includes("://") || path.startsWith("//") || path.includes("\\")) {
    return "/admin"
  }
  if (path.includes("..")) return "/admin"

  const pathOnly = path.split("?")[0]?.split("#")[0] ?? path
  if (!pathOnly.startsWith("/admin") || pathOnly.includes("..")) {
    return "/admin"
  }

  return pathOnly
}

import { isAdminAuthenticated } from "@/lib/admin/auth"

export async function requireAdminApi(): Promise<Response | null> {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

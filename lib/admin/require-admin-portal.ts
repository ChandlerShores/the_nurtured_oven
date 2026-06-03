import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin/auth"

/** Portal layout guard — middleware also enforces auth; this covers RSC directly. */
export async function requireAdminPortal(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login")
  }
}

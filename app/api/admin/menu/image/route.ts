import { NextResponse } from "next/server"
import { isValidMenuSlug } from "@/lib/admin/menu-slug"
import { requireAdminApi } from "@/lib/admin/require-admin"
import { saveMenuImageFile } from "@/lib/admin/save-menu-image"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 })
  }

  const slug = String(formData.get("slug") ?? "").trim()
  const file = formData.get("file")

  if (!isValidMenuSlug(slug)) {
    return NextResponse.json({ error: "Invalid item ID for image upload." }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 })
  }

  try {
    const { imageUrl, imageSlug } = await saveMenuImageFile(slug, file)
    return NextResponse.json({ ok: true, imageUrl, imageSlug })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save image."
    console.error("[admin] menu image upload failed", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

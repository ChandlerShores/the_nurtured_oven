import "server-only"

import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { getDeploymentTier } from "@/lib/env/deployment"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function extensionForMime(type: string): string {
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  return "jpg"
}

export async function saveMenuImageFile(
  slug: string,
  file: File
): Promise<{ imageUrl: string; imageSlug: string }> {
  if (!file.size) {
    throw new Error("Choose an image file to upload.")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.")
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.")
  }

  const ext = extensionForMime(file.type)
  const buffer = Buffer.from(await file.arrayBuffer())
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim()

  if (blobToken) {
    const { put } = await import("@vercel/blob")
    const blob = await put(`menu/${slug}.${ext}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    })
    return { imageUrl: blob.url, imageSlug: slug }
  }

  if (getDeploymentTier() !== "development") {
    throw new Error(
      "Menu image uploads require BLOB_READ_WRITE_TOKEN outside local development."
    )
  }

  const dir = path.join(process.cwd(), "public", "images", "menu")
  await mkdir(dir, { recursive: true })
  const filename = `${slug}.${ext}`
  await writeFile(path.join(dir, filename), buffer)
  return { imageUrl: `/images/menu/${filename}`, imageSlug: slug }
}

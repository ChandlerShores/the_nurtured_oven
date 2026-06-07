import path from "path"
import { readFile } from "fs/promises"
import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"

const IMAGES_ROOT = path.join(
  process.cwd(),
  "docs",
  "sops",
  "baker",
  "images"
)

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
}

export async function GET(
  _request: Request,
  { params }: { params: { path?: string[] } }
) {
  if (!(await isAdminAuthenticated())) {
    return new NextResponse("Not found", { status: 404 })
  }

  const parts = params.path ?? []
  const relative = parts.join(path.sep)
  const resolved = path.resolve(IMAGES_ROOT, relative)
  if (!resolved.startsWith(IMAGES_ROOT + path.sep)) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext = path.extname(resolved).toLowerCase()
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 })
  }

  try {
    const file = await readFile(resolved)
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}

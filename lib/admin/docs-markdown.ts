import path from "path"
import { readFile } from "fs/promises"
import { cache } from "react"
import { findAdminDoc } from "@/lib/admin/docs-registry"

export interface RenderedAdminDoc {
  title: string
  html: string
}

const ROOT = process.cwd()

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safeHref = String(href).startsWith("./")
        ? `/admin/docs/${String(href).replace("./", "").replace(".md", "")}`
        : String(href)
      return `<a href="${escapeHtml(safeHref)}">${escapeHtml(label)}</a>`
    })
}

function adminImageSrc(src: string): string {
  const normalized = src.replace(/^\.\//, "")
  if (!normalized.startsWith("images/")) return ""
  return `/api/admin/docs/image/${normalized}`
}

export function renderAdminMarkdown(markdown: string): RenderedAdminDoc {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  let title = "Guide"
  let html = ""
  let listOpen = false

  function closeList() {
    if (listOpen) {
      html += "</ul>"
      listOpen = false
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      closeList()
      continue
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (image) {
      closeList()
      const src = adminImageSrc(image[2] ?? "")
      const alt = image[1] ?? ""
      if (src) {
        html += `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(alt)}</figcaption></figure>`
      }
      continue
    }

    if (line.startsWith("# ")) {
      closeList()
      title = line.replace(/^#\s+/, "")
      html += `<h1>${inlineMarkdown(title)}</h1>`
      continue
    }
    if (line.startsWith("## ")) {
      closeList()
      html += `<h2>${inlineMarkdown(line.replace(/^##\s+/, ""))}</h2>`
      continue
    }
    if (line.startsWith("### ")) {
      closeList()
      html += `<h3>${inlineMarkdown(line.replace(/^###\s+/, ""))}</h3>`
      continue
    }
    if (line.startsWith("- [ ] ")) {
      if (!listOpen) {
        html += "<ul>"
        listOpen = true
      }
      html += `<li><span aria-hidden="true">□</span> ${inlineMarkdown(line.replace(/^- \[ \]\s+/, ""))}</li>`
      continue
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!listOpen) {
        html += "<ul>"
        listOpen = true
      }
      html += `<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`
      continue
    }

    closeList()
    const expected = line.startsWith("Expected result:")
    html += `<p${expected ? ' class="expected-label"' : ""}>${inlineMarkdown(line)}</p>`
  }

  closeList()
  return { title, html }
}

export const loadAdminDocMarkdown = cache(async (slug: string) => {
  const doc = findAdminDoc(slug)
  if (!doc) return null
  const fullPath = path.join(ROOT, doc.markdownPath)
  const markdown = await readFile(fullPath, "utf8")
  return {
    doc,
    rendered: renderAdminMarkdown(markdown),
  }
})

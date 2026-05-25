/**
 * Export /playbook as PDF + per-page JPEGs in the project root.
 * Usage: pnpm playbook:export
 * Requires dev server on PORT (default 3000) or set PLAYBOOK_EXPORT_URL.
 */

import { spawn } from "child_process"
import http from "http"
import path from "path"
import { chromium } from "playwright"

const ROOT = path.resolve(__dirname, "..")
const PORT = process.env.PORT || "3000"
const BASE_URL = process.env.PLAYBOOK_EXPORT_URL || `http://localhost:${PORT}`
const PDF_NAME = "owner-playbook.pdf"
const JPEG_PREFIX = "playbook-page"

async function isServerUp(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume()
      resolve(res.statusCode !== undefined && res.statusCode < 500)
    })
    req.on("error", () => resolve(false))
    req.setTimeout(3000, () => {
      req.destroy()
      resolve(false)
    })
  })
}

async function waitForServer(url: string, attempts = 60): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    if (await isServerUp(url)) return
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`Server not reachable at ${url}`)
}

function startDevServer(): ReturnType<typeof spawn> {
  const isWin = process.platform === "win32"
  const child = spawn(isWin ? "pnpm.cmd" : "pnpm", ["dev"], {
    cwd: ROOT,
    stdio: "pipe",
    shell: isWin,
    env: { ...process.env, PORT },
  })
  child.stdout?.on("data", () => {})
  child.stderr?.on("data", () => {})
  return child
}

async function main() {
  const homeUrl = `${BASE_URL}/`
  let devProcess: ReturnType<typeof spawn> | null = null
  const startedLocally = !(await isServerUp(homeUrl))

  if (startedLocally) {
    console.log(`Starting dev server on port ${PORT}...`)
    devProcess = startDevServer()
    await waitForServer(homeUrl)
  }

  const playbookUrl = `${BASE_URL}/playbook`
  console.log(`Exporting from ${playbookUrl}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(playbookUrl, { waitUntil: "networkidle" })
    await page.emulateMedia({ media: "print" })

    const pdfPath = path.join(ROOT, PDF_NAME)
    await page.pdf({
      path: pdfPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0.75in", right: "0.85in", bottom: "0.75in", left: "0.85in" },
    })
    console.log(`Wrote ${pdfPath}`)

    await page.evaluate(() => {
      document.body.classList.add("playbook-export-jpegs")
    })
    await page.emulateMedia({ media: "screen" })
    await page.waitForTimeout(300)

    const sections = page.locator("section.playbook-page")
    const count = await sections.count()

    for (let i = 0; i < count; i++) {
      const jpegPath = path.join(ROOT, `${JPEG_PREFIX}-${String(i + 1).padStart(2, "0")}.jpg`)
      await sections.nth(i).screenshot({
        path: jpegPath,
        type: "jpeg",
        quality: 92,
      })
      console.log(`Wrote ${jpegPath}`)
    }
  } finally {
    await browser.close()
    if (devProcess) {
      devProcess.kill("SIGTERM")
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(devProcess.pid), "/f", "/t"], { shell: true })
      }
    }
  }

  console.log("\nDone. Share owner-playbook.pdf or the playbook-page-*.jpg files via text.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

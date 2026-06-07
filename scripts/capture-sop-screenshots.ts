/**
 * Capture local-only SOP screenshots from workflow metadata.
 *
 * Usage:
 *   ENABLE_SOP_TOOLS=true pnpm sop:capture update-weekly-menu
 *
 * The script refuses production-like targets and does not click destructive or
 * save controls. It uses existing admin login with ADMIN_PASSWORD from env or
 * .env.local.
 */

import { spawn } from "child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import http from "http"
import path from "path"
import { chromium, type Browser, type Page } from "playwright"
import { sopRegistry } from "../sop/registry"
import type { SopWorkflow, SopWorkflowStep } from "../sop/types"

const ROOT = path.resolve(__dirname, "..")
const PORT = process.env.PORT || "3000"
const DEFAULT_BASE_URL = `http://localhost:${PORT}`
const BASE_URL = (
  process.env.LOCAL_APP_URL ||
  process.env.PLAYWRIGHT_BASE_URL ||
  DEFAULT_BASE_URL
).replace(/\/$/, "")
const OUTPUT_ROOT = path.join(ROOT, "docs", "sops", "baker", "images")
const VIEWPORT = { width: 1440, height: 1000 }
const HIGHLIGHT_ID = "sop-capture-highlight"
const WINDOWS_BROWSER_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
]

interface CaptureResult {
  stepId: string
  title: string
  file?: string
  missingSelector?: string
  skipped?: string
}

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local")
  if (!existsSync(envPath)) return

  const raw = readFileSync(envPath, "utf8")
  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

function isLocalUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
  } catch {
    return false
  }
}

function assertSafeCaptureTarget() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SOP capture refuses to run with NODE_ENV=production.")
  }

  if (process.env.ENABLE_SOP_TOOLS !== "true") {
    throw new Error("Set ENABLE_SOP_TOOLS=true before running SOP capture.")
  }

  if (!isLocalUrl(BASE_URL) && process.env.ALLOW_NON_LOCAL_SOP_CAPTURE !== "true") {
    throw new Error(
      `SOP capture refuses non-local URL "${BASE_URL}". Use LOCAL_APP_URL with localhost, or set ALLOW_NON_LOCAL_SOP_CAPTURE=true for an intentional non-production target.`,
    )
  }
}

function findWorkflow(slug: string): SopWorkflow {
  const workflow = sopRegistry.workflows.find((item) => item.slug === slug)
  if (!workflow) {
    const available = sopRegistry.workflows.map((item) => item.slug).join(", ")
    throw new Error(`Unknown SOP workflow "${slug}". Available: ${available}`)
  }
  return workflow
}

function localBrowserExecutablePath(): string | undefined {
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim()
  if (explicit) return explicit
  if (process.platform !== "win32") return undefined
  return WINDOWS_BROWSER_PATHS.find((browserPath) => existsSync(browserPath))
}

function routePath(routeKey: string): string {
  const route = sopRegistry.routes[routeKey]
  if (!route) throw new Error(`Workflow references unknown route "${routeKey}".`)
  return route.path
}

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

async function waitForServer(url: string, attempts = 90): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    if (await isServerUp(url)) return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Server not reachable at ${url}`)
}

function startDevServer(): ReturnType<typeof spawn> {
  const isWin = process.platform === "win32"
  const child = spawn(isWin ? "pnpm.cmd" : "pnpm", ["dev"], {
    cwd: ROOT,
    stdio: "pipe",
    shell: isWin,
    env: { ...process.env, PORT, ENABLE_SOP_TOOLS: "true" },
  })
  child.stdout?.on("data", () => {})
  child.stderr?.on("data", () => {})
  return child
}

async function loginIfNeeded(page: Page) {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password) {
    throw new Error("Set ADMIN_PASSWORD in .env.local or env to capture admin SOP screenshots.")
  }

  await page.goto(`${BASE_URL}/admin/login`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  })

  if (!page.url().includes("/admin/login")) return

  await page.locator("#admin-password").fill(password)
  const loginResponse = page.waitForResponse(
    (res) => res.url().includes("/api/admin/login") && res.status() < 400,
    { timeout: 20_000 },
  )
  await page.getByRole("button", { name: "Sign in" }).click()
  await loginResponse
  await page.goto(`${BASE_URL}/admin`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  })
}

async function gotoRoute(page: Page, routeKey: string) {
  const pathname = routePath(routeKey)
  await page.goto(`${BASE_URL}${pathname}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  })
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {})
  await page.waitForTimeout(500)
}

async function ensureAdminAuth(page: Page) {
  await gotoRoute(page, "adminDashboard")
  if (page.url().includes("/admin/login")) {
    await loginIfNeeded(page)
  }
}

function dataSopSelector(dataSop: string): string {
  return `[data-sop="${dataSop}"]`
}

async function clearHighlight(page: Page) {
  await page.evaluate((id) => {
    document.getElementById(id)?.remove()
  }, HIGHLIGHT_ID)
}

async function highlightTarget(page: Page, dataSop?: string): Promise<boolean> {
  await clearHighlight(page)
  if (!dataSop) return true

  const locator = page.locator(dataSopSelector(dataSop)).first()
  const count = await locator.count()
  if (count === 0) return false

  await locator.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  await page.evaluate(
    ({ selector, id }) => {
      const target = document.querySelector(selector)
      if (!target) return

      const rect = target.getBoundingClientRect()
      const marker = document.createElement("div")
      marker.id = id
      marker.style.position = "fixed"
      marker.style.left = `${Math.max(8, rect.left - 8)}px`
      marker.style.top = `${Math.max(8, rect.top - 8)}px`
      marker.style.width = `${Math.min(window.innerWidth - 16, rect.width + 16)}px`
      marker.style.height = `${Math.min(window.innerHeight - 16, rect.height + 16)}px`
      marker.style.border = "4px solid #b86b5e"
      marker.style.borderRadius = "14px"
      marker.style.boxShadow = "0 0 0 9999px rgba(60, 36, 24, 0.12)"
      marker.style.pointerEvents = "none"
      marker.style.zIndex = "2147483647"
      document.body.appendChild(marker)
    },
    { selector: dataSopSelector(dataSop), id: HIGHLIGHT_ID },
  )
  return true
}

async function openFirstMenuEditor(page: Page) {
  const editor = page.locator(dataSopSelector("menu-item-editor")).first()
  if ((await editor.count()) > 0 && (await editor.isVisible())) return

  await gotoRoute(page, "adminMenu")
  const editButton = page.locator(dataSopSelector("menu-item-edit")).first()
  if ((await editButton.count()) === 0) return
  await editButton.click()
  await page.locator(dataSopSelector("menu-item-editor")).first().waitFor({
    state: "visible",
    timeout: 10_000,
  })
  await page.waitForTimeout(300)
}

async function selectFirstMessageOrder(page: Page) {
  await gotoRoute(page, "adminMessages")

  const composer = page.locator(dataSopSelector("customer-updates-composer")).first()
  if ((await composer.count()) === 0) return

  const search = page.locator(dataSopSelector("customer-updates-order-search")).first()
  if ((await search.count()) === 0) return

  await search.fill("Jordan")
  await page.waitForTimeout(300)

  const firstSuggestion = page.locator("#messages-order-suggestions button").first()
  if ((await firstSuggestion.count()) === 0) return

  await firstSuggestion.click()
  await page.waitForTimeout(500)
}

async function prepareStep(page: Page, step: SopWorkflowStep) {
  if (step.route.startsWith("admin")) {
    await ensureAdminAuth(page)
  }

  if (step.id === "open-menu-area") {
    await gotoRoute(page, "adminDashboard")
    return
  }

  if (
    [
      "update-main-details",
      "set-live-and-featured",
      "update-photo",
      "save-item",
    ].includes(step.id)
  ) {
    await openFirstMenuEditor(page)
    return
  }

  if (["send-update", "check-message-log"].includes(step.id)) {
    await selectFirstMessageOrder(page)
    return
  }

  await gotoRoute(page, step.route)
}

async function captureStep(
  page: Page,
  workflow: SopWorkflow,
  step: SopWorkflowStep,
  outDir: string,
): Promise<CaptureResult> {
  if (!step.screenshotName) {
    return {
      stepId: step.id,
      title: step.title,
      skipped: "No screenshotName in workflow metadata.",
    }
  }

  await prepareStep(page, step)
  const target = step.highlightDataSop || step.dataSop
  const highlighted = await highlightTarget(page, target)
  if (!highlighted && target) {
    console.warn(`Missing data-sop target for ${step.id}: ${target}`)
  }

  const filePath = path.join(outDir, step.screenshotName)
  await page.screenshot({ path: filePath, fullPage: false })
  await clearHighlight(page)

  return {
    stepId: step.id,
    title: step.title,
    file: path.relative(ROOT, filePath),
    missingSelector: highlighted ? undefined : target,
  }
}

async function main() {
  loadEnvLocal()
  assertSafeCaptureTarget()

  const slug = process.argv[2]
  if (!slug) throw new Error("Usage: pnpm sop:capture update-weekly-menu")

  const workflow = findWorkflow(slug)
  const outDir = path.join(OUTPUT_ROOT, workflow.slug)
  mkdirSync(outDir, { recursive: true })

  const homeUrl = `${BASE_URL}/`
  let devProcess: ReturnType<typeof spawn> | null = null
  const startedLocally = !(await isServerUp(homeUrl))

  if (startedLocally) {
    console.log(`Starting dev server at ${BASE_URL}...`)
    devProcess = startDevServer()
    await waitForServer(homeUrl)
  } else {
    console.log(`Using server at ${BASE_URL}`)
  }

  let browser: Browser | null = null
  const results: CaptureResult[] = []

  try {
    browser = await chromium.launch({
      executablePath: localBrowserExecutablePath(),
    })
    const page = await browser.newPage({ viewport: VIEWPORT })

    for (const step of workflow.steps) {
      const result = await captureStep(page, workflow, step, outDir)
      results.push(result)
      if (result.file) console.log(`Captured ${step.id}: ${result.file}`)
    }
  } finally {
    await browser?.close()
    if (devProcess) {
      devProcess.kill("SIGTERM")
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(devProcess.pid), "/f", "/t"], {
          shell: true,
        })
      }
    }
  }

  const manifest = {
    workflowSlug: workflow.slug,
    capturedAt: new Date().toISOString(),
    localAppUrl: BASE_URL,
    screenshots: results.filter((item) => item.file),
    missingSelectors: results.filter((item) => item.missingSelector),
    skippedSteps: results.filter((item) => item.skipped),
  }
  const manifestPath = path.join(outDir, "manifest.json")
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log("")
  console.log(`Workflow captured: ${workflow.slug}`)
  console.log(`Screenshots created: ${manifest.screenshots.length}`)
  console.log(`Missing selectors: ${manifest.missingSelectors.length}`)
  console.log(`Skipped steps: ${manifest.skippedSteps.length}`)
  console.log(`Output folder: ${path.relative(ROOT, outDir)}`)
  console.log(`Manifest: ${path.relative(ROOT, manifestPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

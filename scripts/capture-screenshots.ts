/**
 * Capture full-page PNG screenshots into repo-root SCREENSHOTS/.
 * Usage: pnpm screenshots
 * Uses PLAYWRIGHT_BASE_URL or http://localhost:3000; starts pnpm dev if needed.
 * Admin pages require ADMIN_PASSWORD in .env.local (or env).
 */

import { spawn } from "child_process"
import { mkdirSync, readFileSync } from "fs"
import http from "http"
import path from "path"
import { chromium, type Page } from "playwright"

const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "SCREENSHOTS")
const PORT = process.env.PORT || "3000"
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ||
  `http://localhost:${PORT}`

const PUBLIC_ROUTES = [
  "/",
  "/menu",
  "/about",
  "/contact",
  "/faq",
  "/wild-flower-fund",
  "/order/success",
]

const ADMIN_ROUTES = [
  "/admin",
  "/admin/orders",
  "/admin/pickup",
  "/admin/deliveries",
  "/admin/menu",
  "/admin/financials",
  "/admin/settings",
]

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local")
  try {
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
  } catch {
    // optional
  }
}

function routeToFilename(routePath: string): string {
  if (routePath === "/") return "home.png"
  const slug = routePath.replace(/^\//, "").replace(/\//g, "__")
  return `${slug}.png`
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

async function capture(page: Page, routePath: string) {
  const url = `${BASE_URL}${routePath}`
  const file = path.join(OUT_DIR, routeToFilename(routePath))
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`  ${routePath} → ${path.relative(ROOT, file)}`)
}

async function adminLogin(page: Page, password: string) {
  await page.goto(`${BASE_URL}/admin/login`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  })
  await page.locator("#admin-password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 })
}

async function main() {
  loadEnvLocal()
  mkdirSync(OUT_DIR, { recursive: true })

  const homeUrl = `${BASE_URL}/`
  let devProcess: ReturnType<typeof spawn> | null = null
  const startedLocally = !(await isServerUp(homeUrl))

  if (startedLocally) {
    console.log(`Starting dev server on port ${PORT}...`)
    devProcess = startDevServer()
    await waitForServer(homeUrl)
  } else {
    console.log(`Using server at ${BASE_URL}`)
  }

  console.log(`Writing screenshots to ${OUT_DIR}\n`)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  try {
    console.log("Public pages:")
    for (const route of PUBLIC_ROUTES) {
      await capture(page, route)
    }

    console.log("\nAdmin login (unauthenticated):")
    await capture(page, "/admin/login")

    const adminPassword = process.env.ADMIN_PASSWORD?.trim()
    if (adminPassword && adminPassword.length >= 12) {
      console.log("\nAdmin portal (authenticated):")
      await adminLogin(page, adminPassword)
      for (const route of ADMIN_ROUTES) {
        await capture(page, route)
      }
    } else {
      console.log(
        "\nSkipped admin portal pages (set ADMIN_PASSWORD with 12+ chars in .env.local).",
      )
    }
  } finally {
    await browser.close()
    if (devProcess) {
      devProcess.kill("SIGTERM")
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(devProcess.pid), "/f", "/t"], {
          shell: true,
        })
      }
    }
  }

  console.log("\nDone.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

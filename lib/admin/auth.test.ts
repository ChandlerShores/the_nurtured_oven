import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import {
  createAdminSessionTokenAsync,
  verifyAdminSessionToken,
} from "@/lib/admin/session-token"
import { verifyAdminPassword } from "@/lib/admin/auth"
import { safeAdminNextPath } from "@/lib/admin/safe-admin-path"

const ENV = { ...process.env }

describe("admin auth", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-password-12chars"
    delete process.env.ADMIN_SESSION_SECRET
  })

  afterEach(() => {
    process.env = { ...ENV }
  })

  it("verifyAdminPassword uses constant-time compare", () => {
    assert.equal(verifyAdminPassword("test-password-12chars"), true)
    assert.equal(verifyAdminPassword("wrong-password-12c"), false)
    assert.equal(verifyAdminPassword(""), false)
  })

  it("rejects short ADMIN_PASSWORD for sessions", async () => {
    process.env.ADMIN_PASSWORD = "short"
    const token = await createAdminSessionTokenAsync()
    assert.equal(token, null)
  })

  it("creates and verifies session token", async () => {
    const token = await createAdminSessionTokenAsync()
    assert.ok(token)
    assert.equal(await verifyAdminSessionToken(token), true)
    assert.equal(await verifyAdminSessionToken(undefined), false)
    assert.equal(await verifyAdminSessionToken("bad.token.here"), false)
  })

  it("rejects tokens issued in the future", async () => {
    process.env.ADMIN_SESSION_SECRET = "b".repeat(32)
    const future = `${Date.now() + 3600_000}.abc.sig`
    assert.equal(await verifyAdminSessionToken(future), false)
  })

  it("prefers ADMIN_SESSION_SECRET when set", async () => {
    process.env.ADMIN_SESSION_SECRET = "a".repeat(32)
    const token = await createAdminSessionTokenAsync()
    assert.ok(token)
    process.env.ADMIN_PASSWORD = "other-password-12"
    assert.equal(await verifyAdminSessionToken(token), true)
  })

  it("safeAdminNextPath blocks open redirects", () => {
    assert.equal(safeAdminNextPath("/admin/orders"), "/admin/orders")
    assert.equal(safeAdminNextPath("https://evil.com"), "/admin")
    assert.equal(safeAdminNextPath("//evil.com"), "/admin")
    assert.equal(safeAdminNextPath("/shop"), "/admin")
    assert.equal(safeAdminNextPath("/admin/../shop"), "/admin")
  })
})

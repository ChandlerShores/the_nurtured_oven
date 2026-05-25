import { describe, it, after } from "node:test"
import assert from "node:assert/strict"
import {
  getDeploymentTier,
  getPublicAppUrl,
  validateSquareLocationId,
} from "@/lib/env/deployment"

describe("deployment env", () => {
  const env = { ...process.env }

  after(() => {
    process.env = env
  })

  it("uses VERCEL_URL when NEXT_PUBLIC_APP_URL is unset", () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    process.env.VERCEL_URL = "my-app.vercel.app"
    assert.equal(getPublicAppUrl(), "https://my-app.vercel.app")
  })

  it("prefers explicit NEXT_PUBLIC_APP_URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://thenurturedoven.com/"
    delete process.env.VERCEL_URL
    assert.equal(getPublicAppUrl(), "https://thenurturedoven.com")
  })

  it("rejects application id as location id", () => {
    assert.throws(() => validateSquareLocationId("sq0idp-abc"), /Location ID/)
  })

  it("defaults tier to development off Vercel", () => {
    delete process.env.VERCEL_ENV
    assert.equal(getDeploymentTier(), "development")
  })
})

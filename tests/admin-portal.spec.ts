import { expect, test } from "@playwright/test"

test.describe("admin portal", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.getByRole("heading", { name: "Baker sign-in" })).toBeVisible()
  })

  test("protects admin APIs without a session", async ({ request }) => {
    const res = await request.patch("/api/admin/orders/status", {
      data: { internalRef: "TNO-2026-06-06-ABC23", status: "New" },
    })
    expect(res.status()).toBe(401)
  })

  test("protects delivery optimize API without a session", async ({ request }) => {
    const res = await request.post("/api/admin/deliveries/optimize", {
      data: { deliveryDate: "2026-06-06" },
    })
    expect(res.status()).toBe(401)
  })

  test("protects ordering kill switch API without a session", async ({
    request,
  }) => {
    const res = await request.patch("/api/admin/ordering/kill-switch", {
      data: { enabled: true },
    })
    expect(res.status()).toBe(401)
  })

  test("login page is reachable", async ({ page }) => {
    await page.goto("/admin/login")
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })
})

import { test, expect } from "@playwright/test";

test.describe("Site smoke tests", () => {
  test("homepage loads and redirects to /en", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("products listing renders in English", async ({ page }) => {
    await page.goto("/en/products");
    await expect(page.getByText("Sort by")).toBeVisible();
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href="/en/cart"]')).toHaveCount(0);
    await expect(page.getByText("Request quote").first()).toBeVisible();
    await expect(page.getByText("US$", { exact: false })).toHaveCount(0);
  });

  test("hidden homepage sections and inquiry window behave as expected", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Our journey" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Industry recognition" })).toHaveCount(0);
    await page.getByRole("button", { name: "Send inquiry" }).click();
    await expect(page.getByRole("heading", { name: "Request a quote" })).toBeVisible();
  });

  test("product detail page loads", async ({ page }) => {
    await page.goto("/en/products/round-brilliant-cut-1mm");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
      timeout: 10000,
    });
  });

  test("product detail hides public prices and points buyers to inquiry", async ({ page }) => {
    await page.goto("/en/products/round-brilliant-cut-1mm");
    await expect(page.getByRole("link", { name: "Request quote" })).toBeVisible();
    await expect(page.getByText("Price Tiers")).toHaveCount(0);
    await expect(page.getByText("US$", { exact: false })).toHaveCount(0);
  });

  test("cart and checkout routes are unavailable while pricing is hidden", async ({ page }) => {
    await page.goto("/en/cart");
    await expect(page).toHaveURL(/\/en\/products$/);
    await page.goto("/en/checkout");
    await expect(page).toHaveURL(/\/en\/products$/);
  });

  test("inquiry form submits a validated request", async ({ page }) => {
    await page.route("**/api/inquiries", async (route) => {
      expect(route.request().method()).toBe("POST");
      const body = route.request().postDataJSON();
      expect(body.quantity).toBe("5000");
      expect(body.sizeMm).toBe("5 mm");
      expect(body.grade).toBe("5A");
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ received: true, id: "test-inquiry" }) });
    });

    await page.goto("/en#inquiry");
    const inquiryDialog = page.getByRole("dialog");
    await expect(inquiryDialog.getByRole("heading", { name: "Request a quote" })).toBeVisible();
    await inquiryDialog.getByLabel("Quantity (pcs)").fill("5000");
    await inquiryDialog.getByLabel("Size").selectOption("5 mm");
    await inquiryDialog.getByLabel("Grade").selectOption("5A");
    await inquiryDialog.getByLabel("Email").fill("buyer@example.com");
    await inquiryDialog.getByLabel("WhatsApp").fill("+86 138 0000 0000");
    await inquiryDialog.getByRole("button", { name: "Send inquiry" }).click();
    await expect(inquiryDialog.getByText("Thank you. Your inquiry has been sent.")).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.locator("text=Contact Us")).toBeVisible();
  });

  test("shipping page loads", async ({ page }) => {
    await page.goto("/en/shipping");
    await expect(page.locator("text=Shipping")).toBeVisible();
  });

  test("payment page loads", async ({ page }) => {
    await page.goto("/en/payment");
    await expect(page.locator("text=Payment Methods")).toBeVisible();
  });

  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(
      page.getByRole("heading", {
        name: "DFC Cubic Zirconia Factory 后台",
      }),
    ).toBeVisible();
  });

  test("admin products page can add a local preview product", async ({ page }) => {
    const slug = `e2e-product-${Date.now()}`;

    await page.goto("/admin/products");
    await page.getByLabel("Slug").fill(slug);
    await page.getByLabel("商品名称").fill("E2E Preview Stone");
    await page.getByLabel("形状").fill("Round");
    await page.getByLabel("尺寸").fill("1.10 mm");
    await page.getByLabel("起订量").fill("600");
    await page.getByLabel("美元单价").fill("0.03");
    await page.getByLabel("图片地址").fill("/products/round-1mm.png");
    await page.getByRole("button", { name: "添加商品" }).click();

    await expect(page.getByText(slug)).toBeVisible();
  });

  test("admin settings page saves through the settings API", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "系统设置" })).toBeVisible();

    const historyToggle = page.getByRole("switch", { name: "显示发展历程" });
    await expect(historyToggle).toHaveAttribute("aria-checked", "false");
    await historyToggle.click();
    await expect(historyToggle).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "保存全部" }).click();

    await expect(page.getByText(/设置已/)).toBeVisible();
  });

  test("admin inquiries page is available", async ({ page }) => {
    await page.goto("/admin/inquiries");
    await expect(page.getByRole("heading", { name: "客户询盘" })).toBeVisible();
  });

  test("/api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    const body = await res.json();
    expect(body.checks).toBeDefined();
  });
});

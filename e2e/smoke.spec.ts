import { test, expect } from "@playwright/test";

test.describe("Site smoke tests", () => {
  test("homepage loads and redirects to /en", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("products listing renders in English", async ({ page }) => {
    await page.goto("/en/products");
    // Filters heading is hidden on mobile (lg:block only), use Sort visible on all widths
    await expect(page.getByText("Sort by")).toBeVisible();
    // product cards should exist
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href="/en/cart"] span').first()).toHaveText("0");
  });

  test("restoring a saved cart does not cause hydration errors", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => {
      localStorage.setItem(
        "upgrade-gem-cart",
        JSON.stringify([
          {
            productId: "prod-round-1",
            variantId: "round-1-1000",
            quantity: 500,
          },
        ]),
      );
    });

    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") hydrationErrors.push(message.text());
    });
    page.on("pageerror", (error) => hydrationErrors.push(error.message));

    await page.goto("/en/products");
    await expect(page.locator('a[href="/en/cart"] span').first()).toHaveText("1");
    expect(
      hydrationErrors.filter((message) =>
        message.toLowerCase().includes("hydration"),
      ),
    ).toEqual([]);
  });

  test("product detail page loads", async ({ page }) => {
    await page.goto("/en/products/round-brilliant-cut-1mm");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible({
      timeout: 10000,
    });
  });

  test("product detail add-to-cart opens a populated cart", async ({ page }) => {
    await page.goto("/en/products/round-brilliant-cut-1mm");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page).toHaveURL(/\/en\/cart$/);
    await expect(page.getByText("Round Brilliant Cut").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Proceed to Checkout" })).toBeVisible();
  });

  test("cart page loads", async ({ page }) => {
    await page.goto("/en/cart");
    await expect(page.locator("text=Cart")).toBeVisible();
  });

  test("checkout page loads", async ({ page }) => {
    await page.goto("/en/checkout");
    // Even without cart items it should render without crashing
    await expect(page.locator("text=Your cart is empty")).toBeVisible();
  });

  test("checkout creates a token order that appears in admin", async ({ page }) => {
    const companyName = `E2E Gems ${Date.now()}`;

    await page.goto("/en/products/round-brilliant-cut-1mm");
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    await page.getByLabel("Company Name").fill(companyName);
    await page.getByLabel("Contact Person").fill("Aarav Test");
    await page.getByLabel("WhatsApp").fill("+91 90000 11111");
    await page.getByLabel("Email").fill("aarav.test@example.com");
    await page.getByLabel("Country").fill("United Kingdom");
    await page.getByLabel("City").fill("London");
    await page.getByLabel("PIN Code").fill("SW1A 1AA");
    await page.getByLabel("Shipping Address").fill("10 Test Street, London");
    await page.locator("select").selectOption("xtransfer");

    await Promise.all([
      page.waitForURL(/\/en\/order\/GEM-\d{8}-\d{4}\?token=.+/),
      page.getByRole("button", { name: "Place Order" }).click(),
    ]);
    await expect(page.getByRole("heading", { name: "Order received" })).toBeVisible();

    const orderNo = page.url().match(/order\/(GEM-\d{8}-\d{4})/)?.[1];
    expect(orderNo).toBeTruthy();

    await page.goto("/admin");
    await expect(page.getByText(companyName).first()).toBeVisible();
    await expect(page.getByText(orderNo!).first()).toBeVisible();
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

    await page.locator("input").nth(1).fill("150");
    await page.getByRole("button", { name: "保存全部" }).click();

    await expect(page.getByText(/设置已/)).toBeVisible();
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

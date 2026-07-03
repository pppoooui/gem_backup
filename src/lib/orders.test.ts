import { describe, expect, it } from "vitest";
import type { CheckoutOrderInput } from "@/lib/orders";
import type { Product } from "@/types/domain";
import {
  createCheckoutOrder,
  getOrderByToken,
  listAdminOrders,
  resetOrderStoreForTests,
  updateAdminOrder,
} from "@/lib/orders";

const checkoutInput: CheckoutOrderInput = {
  locale: "en",
  customer: {
    companyName: "Aarav Gems",
    contactName: "Aarav Mehta",
    whatsapp: "+91 98765 43210",
    email: "aarav@example.com",
    country: "India",
    city: "Jaipur",
    pinCode: "302003",
    addressLine1: "Johari Bazaar",
    landmark: "Near Hawa Mahal",
    gstin: "08ABCDE1234F1Z5",
    iec: "IEC1234567",
  },
  selectedPaymentProvider: "xtransfer",
  lines: [
    {
      productId: "prod-round-1",
      variantId: "round-1-1000",
      quantity: 2000,
    },
    {
      productId: "prod-princess-250",
      variantId: "princess-250-1000",
      quantity: 500,
    },
  ],
  note: "Need PI on company name.",
};

describe("checkout orders", () => {
  it("creates a token-protected quote order with calculated totals", () => {
    resetOrderStoreForTests();

    const result = createCheckoutOrder(checkoutInput, {
      now: new Date("2026-06-08T04:00:00.000Z"),
      tokenBytes: () => "customer-visible-token",
    });

    expect(result.order.orderNo).toBe("GEM-20260608-0001");
    expect(result.token).toBe("customer-visible-token");
    expect(result.order.subtotalUsd).toBeCloseTo(85.5);
    expect(result.order.totalUsd).toBeCloseTo(85.5);
    expect(result.order.lines).toHaveLength(2);
    expect(result.order.lines[0]).toMatchObject({
      sku: "round-1-1000",
      quantity: 2000,
      unitPriceUsd: 0.024,
      lineTotalUsd: 48,
    });
  });

  it("allows lookup only with the original token", () => {
    resetOrderStoreForTests();

    const { order, token } = createCheckoutOrder(checkoutInput, {
      now: new Date("2026-06-08T04:00:00.000Z"),
      tokenBytes: () => "secret-token",
    });

    expect(getOrderByToken(order.orderNo, token)?.customer.companyName).toBe(
      "Aarav Gems",
    );
    expect(getOrderByToken(order.orderNo, "wrong-token")).toBeNull();
  });

  it("rejects empty carts and India checkout fields that cannot ship", () => {
    resetOrderStoreForTests();

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        lines: [],
      }),
    ).toThrow("Cart is empty");

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        customer: {
          ...checkoutInput.customer,
          pinCode: "3020",
        },
      }),
    ).toThrow("PIN code");
  });

  it("accepts international postal codes outside India", () => {
    resetOrderStoreForTests();

    const result = createCheckoutOrder(
      {
        ...checkoutInput,
        customer: {
          ...checkoutInput.customer,
          country: "Singapore",
          pinCode: "018956",
        },
      },
      { tokenBytes: () => "international-token" },
    );

    expect(result.order.customer.pinCode).toBe("018956");
  });

  it("accepts non-numeric international postal codes", () => {
    resetOrderStoreForTests();

    const result = createCheckoutOrder(
      {
        ...checkoutInput,
        customer: {
          ...checkoutInput.customer,
          country: "United Kingdom",
          pinCode: "SW1A 1AA",
        },
      },
      { tokenBytes: () => "uk-token" },
    );

    expect(result.order.customer.pinCode).toBe("SW1A 1AA");
  });

  it("rejects unbounded quantities and oversized buyer notes", () => {
    resetOrderStoreForTests();

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        lines: [{ ...checkoutInput.lines[0], quantity: 100_000_001 }],
      }),
    ).toThrow("Quantity");

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        note: "x".repeat(2001),
      }),
    ).toThrow("Note");
  });

  it("prices products supplied by the live catalog", () => {
    resetOrderStoreForTests();

    const liveProduct: Product = {
      id: "live-product",
      sku: "LIVE-100",
      slug: "live-product",
      nameEn: "Live Catalog Stone",
      nameZh: "实时目录宝石",
      shape: "Round",
      material: "Cubic Zirconia",
      cut: "Excellent",
      clarity: "VS",
      grade: "5A",
      hsCode: "7104.90",
      imagePath: "/products/round-1mm.png",
      variants: [
        {
          id: "live-variant",
          sizeMm: "1.00 mm",
          color: "Colorless",
          clarity: "VS",
          packageUnit: "pcs",
          moq: 500,
          stockStatus: "in_stock",
          weightGrams: 0,
          priceTiers: [{ minQuantity: 500, priceUsd: 0.05, label: "500+ pcs" }],
        },
      ],
    };

    const result = createCheckoutOrder(
      {
        ...checkoutInput,
        lines: [{ productId: liveProduct.id, variantId: "live-variant", quantity: 500 }],
      },
      { tokenBytes: () => "live-token", catalog: [liveProduct] },
    );

    expect(result.order.lines[0]).toMatchObject({
      productId: "live-product",
      variantId: "live-variant",
      lineTotalUsd: 25,
    });
  });

  it("rejects quantities below MOQ and disabled payment options", () => {
    resetOrderStoreForTests();

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        lines: [
          {
            productId: "prod-round-1",
            variantId: "round-1-1000",
            quantity: 100,
          },
        ],
      }),
    ).toThrow("MOQ");

    expect(() =>
      createCheckoutOrder({
        ...checkoutInput,
        selectedPaymentProvider: "manual",
      }),
    ).toThrow("payment");
  });

  it("lists real checkout orders for admin and updates quote fields", () => {
    resetOrderStoreForTests();

    const { order } = createCheckoutOrder(checkoutInput, {
      now: new Date("2026-06-08T04:00:00.000Z"),
      tokenBytes: () => "admin-token",
    });

    const orders = listAdminOrders();
    expect(orders[0]).toMatchObject({
      orderNo: order.orderNo,
      customerName: "Aarav Gems",
      status: "pending_quote",
      itemCount: 2,
    });

    const updated = updateAdminOrder(order.orderNo, {
      status: "awaiting_payment",
      shippingFeeUsd: 42,
      discountUsd: 5,
      selectedPaymentProvider: "wise",
    });

    expect(updated?.status).toBe("awaiting_payment");
    expect(updated?.totalUsd).toBeCloseTo(122.5);
    expect(listAdminOrders()[0].selectedPaymentProvider).toBe("wise");
  });
});

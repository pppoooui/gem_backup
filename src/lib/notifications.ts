import "server-only";

import type { CheckoutOrder, CheckoutCustomer } from "@/lib/orders";

/**
 * WhatsApp notification service for new orders.
 *
 * Sends a concise order summary to the vendor's WhatsApp number
 * whenever a customer submits a new B2B order.
 *
 * Supported backends (configure via env):
 * - WHATSAPP_NOTIFY_WEBHOOK_URL — generic webhook (n8n, Make, Zapier)
 * - WHATSAPP_CLOUD_API_PHONE_NUMBER_ID + WHATSAPP_CLOUD_API_TOKEN — Meta WhatsApp Cloud API
 */

const WEBHOOK_URL = process.env.WHATSAPP_NOTIFY_WEBHOOK_URL;
const CLOUD_API_PHONE_ID = process.env.WHATSAPP_CLOUD_API_PHONE_NUMBER_ID;
const CLOUD_API_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const VENDOR_PHONE = process.env.WHATSAPP_VENDOR_PHONE_NUMBER;

function buildOrderPayload(order: CheckoutOrder): {
  orderNo: string;
  customer: CheckoutCustomer;
  subtotalUsd: number;
  totalUsd: number;
  itemCount: number;
  paymentProvider: string;
  items: { name: string; quantity: number }[];
  locale: string;
  createdAt: string;
} {
  return {
    orderNo: order.orderNo,
    customer: order.customer,
    subtotalUsd: order.subtotalUsd,
    totalUsd: order.totalUsd,
    itemCount: order.lines.length,
    paymentProvider: order.selectedPaymentProvider,
    items: order.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
    })),
    locale: order.locale,
    createdAt: order.createdAt,
  };
}

function buildWhatsAppText(order: CheckoutOrder): string {
  const items =
    order.lines.length <= 5
      ? order.lines.map((l) => `• ${l.name} (${l.sizeMm}) × ${l.quantity}`).join("\n")
      : `• ${order.lines.length} lines`;
  return [
    `🔔 *New Order*`,
    `Order: *${order.orderNo}*`,
    `From: ${order.customer.companyName} (${order.customer.contactName})`,
    `WhatsApp: ${order.customer.whatsapp}`,
    `Country: ${order.customer.country}, ${order.customer.city}`,
    ``,
    `*Items:*`,
    items,
    ``,
    `Total: US$ ${order.totalUsd.toFixed(2)}`,
    `Payment: ${order.selectedPaymentProvider}`,
    ``,
    `View: /admin/orders`,
  ].join("\n");
}

export async function notifyNewOrder(
  order: CheckoutOrder,
): Promise<{ sent: boolean; provider: "webhook" | "cloud-api" | "none" }> {
  // 1. Cloud API direct (Meta WhatsApp Business)
  if (CLOUD_API_PHONE_ID && CLOUD_API_TOKEN && VENDOR_PHONE) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v22.0/${CLOUD_API_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CLOUD_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: VENDOR_PHONE.replace(/^\+/, ""),
            type: "text",
            text: {
              preview_url: false,
              body: buildWhatsAppText(order),
            },
          }),
        },
      );
      if (res.ok) {
        return { sent: true, provider: "cloud-api" };
      }
      console.error(
        "[notifications] WhatsApp Cloud API error:",
        await res.text(),
      );
    } catch (err) {
      console.error("[notifications] WhatsApp Cloud API exception:", err);
    }
  }

  // 2. Generic webhook fallback
  if (WEBHOOK_URL) {
    try {
      const payload = buildOrderPayload(order);
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_order",
          whatsappMessage: buildWhatsAppText(order),
          ...payload,
        }),
      });
      if (res.ok) {
        return { sent: true, provider: "webhook" };
      }
      console.error("[notifications] Webhook error:", await res.text());
    } catch (err) {
      console.error("[notifications] Webhook exception:", err);
    }
  }

  // 3. Nothing configured — silent no-op
  return { sent: false, provider: "none" };
}

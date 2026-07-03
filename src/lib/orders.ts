import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { paymentMethods, products } from "@/data/products";
import { notifyNewOrder } from "@/lib/notifications";
import { getEnabledPaymentMethods } from "@/lib/payment-methods";
import { getPublishedProducts } from "@/lib/products-supabase";
import type {
  AdminOrder,
  CartLine,
  Locale,
  OrderStatus,
  PaymentProvider,
  Product,
} from "@/types/domain";

export type CheckoutCustomer = {
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  landmark?: string;
  gstin?: string;
  iec?: string;
};

export type CheckoutOrderInput = {
  locale: Locale;
  customer: CheckoutCustomer;
  selectedPaymentProvider: PaymentProvider;
  lines: CartLine[];
  note?: string;
};

export type CheckoutOrderLine = {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  imagePath: string;
  sizeMm: string;
  color: string;
  grade: string;
  hsCode: string;
  packageUnit: string;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
};

export type CheckoutOrder = {
  id: string;
  orderNo: string;
  locale: Locale;
  customer: CheckoutCustomer;
  lines: CheckoutOrderLine[];
  subtotalUsd: number;
  shippingFeeUsd: number;
  discountUsd: number;
  totalUsd: number;
  status: OrderStatus;
  selectedPaymentProvider: PaymentProvider;
  note?: string;
  paymentScreenshotUrl?: string | null;
  createdAt: string;
  tokenHash: string;
};

export type PublicCheckoutOrder = Omit<CheckoutOrder, "tokenHash">;

type CreateOptions = {
  now?: Date;
  tokenBytes?: () => string;
  catalog?: Product[];
};

type AdminOrderUpdate = {
  status?: OrderStatus;
  shippingFeeUsd?: number;
  discountUsd?: number;
  selectedPaymentProvider?: PaymentProvider;
};

type SupabaseCustomerRow = {
  company_name?: string | null;
  contact_name?: string | null;
  name?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  country?: string | null;
  city?: string | null;
  pin_code?: string | null;
  landmark?: string | null;
  shipping_address?: string | null;
  india_gstin?: string | null;
  iec?: string | null;
};

type SupabaseOrderItemRow = {
  product_id?: string | null;
  variant_id?: string | null;
  sku?: string | null;
  product_name_en: string;
  image_path?: string | null;
  size_mm: string;
  color?: string | null;
  grade?: string | null;
  hs_code?: string | null;
  package_unit: string;
  quantity: number | string;
  price_usd: number | string;
  line_total_usd?: number | string | null;
};

type SupabaseOrderRow = {
  id: string;
  order_no: string;
  locale?: Locale | null;
  status: OrderStatus;
  subtotal_usd: number | string;
  shipping_fee_usd: number | string;
  discount_usd: number | string;
  total_usd: number | string;
  selected_payment_provider?: PaymentProvider | null;
  buyer_note?: string | null;
  payment_screenshot_url?: string | null;
  secure_token_hash: string;
  created_at: string;
  customers?: SupabaseCustomerRow | SupabaseCustomerRow[] | null;
  order_items?: SupabaseOrderItemRow[] | null;
};

type OrderStore = {
  orders: Map<string, CheckoutOrder>;
};

const checkoutCustomerSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company name is required").max(160),
    contactName: z.string().trim().min(2, "Contact name is required").max(120),
    whatsapp: z.string().trim().min(8, "WhatsApp is required").max(40),
    email: z.string().trim().email("Email is invalid").max(254),
    country: z.string().trim().min(2, "Country is required").max(80),
    city: z.string().trim().min(2, "City is required").max(100),
    pinCode: z.string().trim().min(3, "Postal code is required").max(16),
    addressLine1: z
      .string()
      .trim()
      .min(5, "Shipping address is required")
      .max(300),
    landmark: z.string().trim().max(160).optional(),
    gstin: z.string().trim().max(32).optional(),
    iec: z.string().trim().max(32).optional(),
  })
  .superRefine((customer, context) => {
    if (/^(india|in)$/i.test(customer.country) && !/^\d{6}$/.test(customer.pinCode)) {
      context.addIssue({
        code: "custom",
        path: ["pinCode"],
        message: "PIN code must be 6 digits for India shipping",
      });
    }
  });

const checkoutOrderInputSchema = z.object({
  locale: z.enum(["en", "zh"]),
  customer: checkoutCustomerSchema,
  selectedPaymentProvider: z.string(),
  lines: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        variantId: z.string().trim().min(1),
        quantity: z
          .number()
          .int()
          .positive()
          .max(100_000_000, "Quantity is too large"),
      }),
    )
    .min(1, "Cart is empty")
    .max(50, "Cart has too many lines"),
  note: z.string().trim().max(2000, "Note is too long").optional(),
});

export class CheckoutInputError extends Error {}

declare global {
  var __upgradeGemOrderStore: OrderStore | undefined;
}

function orderStore() {
  if (!globalThis.__upgradeGemOrderStore) {
    globalThis.__upgradeGemOrderStore = {
      orders: new Map<string, CheckoutOrder>(),
    };
  }

  return globalThis.__upgradeGemOrderStore;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hasSupabaseAdminConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function createSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function nextToken(options?: CreateOptions) {
  return options?.tokenBytes?.() ?? randomBytes(24).toString("base64url");
}

function dateStamp(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function toNullableUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function nextOrderNo(now: Date) {
  const prefix = `GEM-${dateStamp(now)}-`;
  const count = Array.from(orderStore().orders.values()).filter((order) =>
    order.orderNo.startsWith(prefix),
  ).length;

  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

async function nextPersistedOrderNo(now: Date) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return nextOrderNo(now);
  }

  const { data: generatedOrderNo, error: sequenceError } = await supabase.rpc(
    "next_order_number",
  );

  if (!sequenceError && typeof generatedOrderNo === "string") {
    return generatedOrderNo;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      sequenceError?.message ??
        "next_order_number did not return a valid order number",
    );
  }

  // Compatibility fallback until migration 0007 is applied.
  const prefix = `GEM-${dateStamp(now)}-`;
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .like("order_no", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  return `${prefix}${String((count ?? 0) + 1).padStart(4, "0")}`;
}

function assertStaticPaymentProvider(provider: PaymentProvider) {
  const method = paymentMethods.find((item) => item.provider === provider);

  if (!method?.enabled) {
    throw new CheckoutInputError("Selected payment option is unavailable");
  }
}

async function assertPersistedPaymentProvider(provider: PaymentProvider) {
  const method = (await getEnabledPaymentMethods()).find(
    (item) => item.provider === provider,
  );

  if (!method) {
    throw new CheckoutInputError("Selected payment option is unavailable");
  }
}

function resolveOrderLine(
  line: CartLine,
  catalog: Product[] = products,
): CheckoutOrderLine {
  const product = catalog.find((item) => item.id === line.productId);
  const variant = product?.variants.find((item) => item.id === line.variantId);

  if (!product || !variant) {
    throw new CheckoutInputError("Cart contains an unavailable product");
  }

  if (line.quantity < variant.moq) {
    throw new CheckoutInputError(`${variant.id} quantity is below MOQ`);
  }

  const tier = [...variant.priceTiers]
    .reverse()
    .find((item) => line.quantity >= item.minQuantity);
  const unitPriceUsd = tier?.priceUsd ?? variant.priceTiers[0].priceUsd;
  const lineTotalUsd = Number((unitPriceUsd * line.quantity).toFixed(2));

  return {
    productId: product.id,
    variantId: variant.id,
    sku: variant.id,
    name: product.nameEn,
    imagePath: product.imagePath,
    sizeMm: variant.sizeMm,
    color: variant.color,
    grade: product.grade,
    hsCode: product.hsCode,
    packageUnit: variant.packageUnit,
    quantity: line.quantity,
    unitPriceUsd,
    lineTotalUsd,
  };
}

export function createCheckoutOrder(
  rawInput: CheckoutOrderInput,
  options?: CreateOptions,
) {
  const input = checkoutOrderInputSchema.parse(rawInput) as CheckoutOrderInput;
  assertStaticPaymentProvider(input.selectedPaymentProvider);

  const now = options?.now ?? new Date();
  const token = nextToken(options);
  const orderLines = input.lines.map((line) =>
    resolveOrderLine(line, options?.catalog),
  );
  const subtotalUsd = Number(
    orderLines.reduce((sum, line) => sum + line.lineTotalUsd, 0).toFixed(2),
  );
  const orderNo = nextOrderNo(now);
  const order: CheckoutOrder = {
    id: randomUUID(),
    orderNo,
    locale: input.locale,
    customer: input.customer,
    lines: orderLines,
    subtotalUsd,
    shippingFeeUsd: 0,
    discountUsd: 0,
    totalUsd: subtotalUsd,
    status: "pending_quote",
    selectedPaymentProvider: input.selectedPaymentProvider,
    note: input.note,
    createdAt: now.toISOString(),
    tokenHash: hashToken(token),
  };

  orderStore().orders.set(orderNo, order);

  return { order, token };
}

export async function createPersistedCheckoutOrder(
  rawInput: CheckoutOrderInput,
  options?: CreateOptions,
) {
  if (!hasSupabaseAdminConfig()) {
    return createCheckoutOrder(rawInput, options);
  }

  const input = checkoutOrderInputSchema.parse(rawInput) as CheckoutOrderInput;
  await assertPersistedPaymentProvider(input.selectedPaymentProvider);

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return createCheckoutOrder(input, options);
  }

  const now = options?.now ?? new Date();
  const token = nextToken(options);
  const catalog = options?.catalog ?? (await getPublishedProducts());
  const orderLines = input.lines.map((line) => resolveOrderLine(line, catalog));
  const subtotalUsd = Number(
    orderLines.reduce((sum, line) => sum + line.lineTotalUsd, 0).toFixed(2),
  );
  const orderNo = await nextPersistedOrderNo(now);

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      company_name: input.customer.companyName,
      contact_name: input.customer.contactName,
      name: input.customer.companyName,
      whatsapp: input.customer.whatsapp,
      email: input.customer.email,
      country: input.customer.country,
      city: input.customer.city,
      pin_code: input.customer.pinCode,
      landmark: input.customer.landmark,
      shipping_address: input.customer.addressLine1,
      india_gstin: input.customer.gstin,
      iec: input.customer.iec,
    })
    .select("id")
    .single();

  if (customerError) {
    throw new Error(customerError.message);
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_no: orderNo,
      locale: input.locale,
      customer_id: customer.id,
      status: "pending_quote",
      subtotal_usd: subtotalUsd,
      discount_usd: 0,
      shipping_fee_usd: 0,
      total_usd: subtotalUsd,
      selected_payment_provider: input.selectedPaymentProvider,
      secure_token_hash: hashToken(token),
      buyer_note: input.note,
      created_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (orderError) {
    await supabase.from("customers").delete().eq("id", customer.id);
    throw new Error(orderError.message);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderLines.map((line) => ({
      order_id: orderRow.id,
      product_id: toNullableUuid(line.productId),
      variant_id: toNullableUuid(line.variantId),
      sku: line.sku,
      product_name_en: line.name,
      product_name_zh: line.name,
      image_path: line.imagePath,
      size_mm: line.sizeMm,
      color: line.color,
      grade: line.grade,
      hs_code: line.hsCode,
      package_unit: line.packageUnit,
      quantity: line.quantity,
      price_usd: line.unitPriceUsd,
      line_total_usd: line.lineTotalUsd,
    })),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderRow.id);
    await supabase.from("customers").delete().eq("id", customer.id);
    throw new Error(itemsError.message);
  }

  const order = await getPersistedOrderByToken(orderNo, token);

  if (!order) {
    throw new Error("Order was created but could not be reloaded");
  }

  // Fire-and-forget WhatsApp notification — never blocks the API response
  void notifyNewOrder(order);

  return { order, token };
}

export function getOrderByToken(orderNo: string, token: string) {
  const order = orderStore().orders.get(orderNo);

  if (!order || order.tokenHash !== hashToken(token)) {
    return null;
  }

  return order;
}

export async function getPersistedOrderByToken(orderNo: string, token: string) {
  if (!hasSupabaseAdminConfig()) {
    return getOrderByToken(orderNo, token);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return getOrderByToken(orderNo, token);
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_no,
      locale,
      status,
      subtotal_usd,
      shipping_fee_usd,
      discount_usd,
      total_usd,
      selected_payment_provider,
      buyer_note,
      payment_screenshot_url,
      secure_token_hash,
      created_at,
      customers (
        company_name,
        contact_name,
        name,
        whatsapp,
        email,
        country,
        city,
        pin_code,
        landmark,
        shipping_address,
        india_gstin,
        iec
      ),
      order_items (
        product_id,
        variant_id,
        sku,
        product_name_en,
        image_path,
        size_mm,
        color,
        grade,
        hs_code,
        package_unit,
        quantity,
        price_usd,
        line_total_usd
      )
    `,
    )
    .eq("order_no", orderNo)
    .eq("secure_token_hash", hashToken(token))
    .single();

  if (error || !data) {
    return null;
  }

  return mapSupabaseOrder(data);
}

export function listAdminOrders(): AdminOrder[] {
  return Array.from(orderStore().orders.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toAdminOrder);
}

export async function listPersistedAdminOrders(
  orderNo?: string,
): Promise<AdminOrder[]> {
  if (!hasSupabaseAdminConfig()) {
    return listAdminOrders();
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return listAdminOrders();
  }

  let query = supabase
    .from("orders")
    .select(
      `
      id,
      order_no,
      locale,
      status,
      subtotal_usd,
      shipping_fee_usd,
      discount_usd,
      total_usd,
      selected_payment_provider,
      buyer_note,
      payment_screenshot_url,
      secure_token_hash,
      created_at,
      customers (
        company_name,
        contact_name,
        name,
        whatsapp,
        email,
        country,
        city,
        pin_code,
        landmark,
        shipping_address,
        india_gstin,
        iec
      ),
      order_items (
        product_id,
        variant_id,
        sku,
        product_name_en,
        image_path,
        size_mm,
        color,
        grade,
        hs_code,
        package_unit,
        quantity,
        price_usd,
        line_total_usd
      )
    `,
    );

  query = orderNo
    ? query.eq("order_no", orderNo).limit(1)
    : query.order("created_at", { ascending: false }).limit(50);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => toAdminOrder(mapSupabaseOrder(row)));
}

export function updateAdminOrder(orderNo: string, update: AdminOrderUpdate) {
  const order = orderStore().orders.get(orderNo);

  if (!order) {
    return null;
  }

  const shippingFeeUsd = update.shippingFeeUsd ?? order.shippingFeeUsd;
  const discountUsd = update.discountUsd ?? order.discountUsd;

  const updated: CheckoutOrder = {
    ...order,
    status: update.status ?? order.status,
    shippingFeeUsd,
    discountUsd,
    selectedPaymentProvider:
      update.selectedPaymentProvider ?? order.selectedPaymentProvider,
    totalUsd: Math.max(order.subtotalUsd + shippingFeeUsd - discountUsd, 0),
  };

  orderStore().orders.set(orderNo, updated);

  return updated;
}

export async function updatePersistedAdminOrder(
  orderNo: string,
  update: AdminOrderUpdate,
) {
  if (!hasSupabaseAdminConfig()) {
    return updateAdminOrder(orderNo, update);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return updateAdminOrder(orderNo, update);
  }

  const { data: current, error: currentError } = await supabase
    .from("orders")
    .select("subtotal_usd, shipping_fee_usd, discount_usd")
    .eq("order_no", orderNo)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }
  if (!current) {
    return null;
  }

  const subtotalUsd = Number(current.subtotal_usd);
  const shippingFeeUsd = update.shippingFeeUsd ?? Number(current.shipping_fee_usd);
  const discountUsd = update.discountUsd ?? Number(current.discount_usd);
  const totalUsd = Math.max(subtotalUsd + shippingFeeUsd - discountUsd, 0);

  const persistedUpdate: Record<string, string | number> = {
    shipping_fee_usd: shippingFeeUsd,
    discount_usd: discountUsd,
    total_usd: totalUsd,
  };
  if (update.status) persistedUpdate.status = update.status;
  if (update.selectedPaymentProvider) {
    persistedUpdate.selected_payment_provider = update.selectedPaymentProvider;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(persistedUpdate)
    .eq("order_no", orderNo)
    .select("secure_token_hash")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Order not found");
  }

  return (await listPersistedAdminOrders(orderNo))[0] ?? null;
}

function toAdminOrder(order: CheckoutOrder): AdminOrder {
  return {
    id: order.id,
    orderNo: order.orderNo,
    customerName: order.customer.companyName,
    contactName: order.customer.contactName,
    customerEmail: order.customer.email,
    customerWhatsApp: order.customer.whatsapp,
    city: order.customer.city,
    pinCode: order.customer.pinCode,
    addressLine1: order.customer.addressLine1,
    landmark: order.customer.landmark,
    gstin: order.customer.gstin,
    iec: order.customer.iec,
    subtotalUsd: order.subtotalUsd,
    shippingFeeUsd: order.shippingFeeUsd,
    discountUsd: order.discountUsd,
    totalUsd: order.totalUsd,
    status: order.status,
    selectedPaymentProvider: order.selectedPaymentProvider,
    itemCount: order.lines.length,
    createdAt: order.createdAt,
    note: order.note,
    paymentScreenshotUrl: order.paymentScreenshotUrl ?? null,
    lines: order.lines.map((line) => ({
      sku: line.sku,
      name: line.name,
      sizeMm: line.sizeMm,
      quantity: line.quantity,
      unitPriceUsd: line.unitPriceUsd,
      lineTotalUsd: line.lineTotalUsd,
    })),
  };
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function mapSupabaseOrder(row: SupabaseOrderRow): CheckoutOrder {
  const customer = firstRelation(row.customers) ?? {};
  const items = Array.isArray(row.order_items) ? row.order_items : [];

  return {
    id: row.id,
    orderNo: row.order_no,
    locale: row.locale ?? "en",
    customer: {
      companyName: customer.company_name ?? customer.name ?? "Unknown customer",
      contactName: customer.contact_name ?? customer.name ?? "Unknown contact",
      whatsapp: customer.whatsapp ?? "",
      email: customer.email ?? "",
      country: customer.country ?? "India",
      city: customer.city ?? "",
      pinCode: customer.pin_code ?? "",
      addressLine1: customer.shipping_address ?? "",
      landmark: customer.landmark ?? undefined,
      gstin: customer.india_gstin ?? undefined,
      iec: customer.iec ?? undefined,
    },
    lines: items.map((item) => ({
      productId: item.product_id ?? "",
      variantId: item.variant_id ?? item.sku ?? "",
      sku: item.sku ?? item.variant_id ?? "",
      name: item.product_name_en,
      imagePath: item.image_path ?? "/products/round-1mm.png",
      sizeMm: item.size_mm,
      color: item.color ?? "",
      grade: item.grade ?? "",
      hsCode: item.hs_code ?? "",
      packageUnit: item.package_unit,
      quantity: Number(item.quantity),
      unitPriceUsd: Number(item.price_usd),
      lineTotalUsd: Number(
        item.line_total_usd ?? Number(item.price_usd) * Number(item.quantity),
      ),
    })),
    subtotalUsd: Number(row.subtotal_usd),
    shippingFeeUsd: Number(row.shipping_fee_usd),
    discountUsd: Number(row.discount_usd),
    totalUsd: Number(row.total_usd),
    status: row.status,
    selectedPaymentProvider: row.selected_payment_provider ?? "xtransfer",
    note: row.buyer_note ?? undefined,
    paymentScreenshotUrl: row.payment_screenshot_url ?? null,
    createdAt: row.created_at,
    tokenHash: row.secure_token_hash,
  };
}

export function toPublicOrder(order: CheckoutOrder): PublicCheckoutOrder {
  // Keep token material server-side even for a token-authorized customer page.
  const publicOrder: Partial<CheckoutOrder> = { ...order };
  delete publicOrder.tokenHash;
  return publicOrder as PublicCheckoutOrder;
}

export function resetOrderStoreForTests() {
  orderStore().orders.clear();
}

export type Locale = "en" | "zh";

export type ProductShape =
  | "Round"
  | "Princess"
  | "Oval"
  | "Pear"
  | "Heart"
  | "Marquise";

export type OrderStatus =
  | "pending_quote"
  | "awaiting_payment"
  | "payment_submitted"
  | "paid"
  | "processing"
  | "shipped"
  | "cancelled";

export type PaymentProvider =
  | "xtransfer"
  | "worldfirst"
  | "airwallex"
  | "wise"
  | "bank_transfer"
  | "manual";

export type AdminRole = "admin" | "superadmin";

export type HealthCheckStatus = "ok" | "warn" | "error";

// ---------------------------------------------------------------------------
// Domain entities — must stay aligned with supabase/migrations/
// ---------------------------------------------------------------------------

export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  sortOrder: number;
  createdAt: string;
};

export type ExchangeRate = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source?: string;
  expiresAt?: string;
  createdAt: string;
};

export type ShipmentQuote = {
  id: string;
  orderId: string;
  carrier: string;
  serviceLevel?: string;
  estimatedDays?: number;
  costUsd: number;
  isSelected: boolean;
  adminNote?: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  labelEn?: string;
  descriptionEn?: string;
  updatedAt: string;
};

export type HealthCheckResult = {
  id: string;
  checkName: string;
  status: HealthCheckStatus;
  detail?: string;
  durationMs?: number;
  createdAt: string;
};

export type PriceTier = {
  minQuantity: number;
  priceUsd: number;
  label: string;
};

export type ProductVariant = {
  id: string;
  sizeMm: string;
  color: string;
  clarity: string;
  packageUnit: string;
  moq: number;
  stockStatus: "in_stock" | "low_stock" | "quote_only";
  stockNote?: string;
  weightGrams: number;
  priceTiers: PriceTier[];
};

export type Product = {
  id: string;
  sku: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  shape: ProductShape;
  material: string;
  cut: string;
  clarity: string;
  grade: "5A" | "3A" | "2A";
  hsCode: string;
  imagePath: string;
  variants: ProductVariant[];
};

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type PaymentMethod = {
  id: string;
  provider: PaymentProvider;
  name: string;
  enabled: boolean;
  currencies: string[];
  countries: string[];
  minAmountUsd?: number;
};

export type AdminOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  customerEmail?: string;
  customerWhatsApp: string;
  contactName?: string;
  city: string;
  pinCode: string;
  addressLine1?: string;
  landmark?: string;
  gstin?: string;
  iec?: string;
  subtotalUsd: number;
  shippingFeeUsd: number;
  discountUsd: number;
  totalUsd: number;
  status: OrderStatus;
  selectedPaymentProvider: PaymentProvider;
  itemCount: number;
  createdAt: string;
  note?: string;
  paymentScreenshotUrl?: string | null;
  lines?: {
    sku: string;
    name: string;
    sizeMm: string;
    quantity: number;
    unitPriceUsd: number;
    lineTotalUsd: number;
  }[];
};

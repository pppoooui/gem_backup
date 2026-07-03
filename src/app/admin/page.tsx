import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { listPersistedAdminOrders } from "@/lib/orders";
import { getAdminPaymentMethods } from "@/lib/payment-methods";

export const dynamic = "force-dynamic";

function getStorefrontUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return `${configuredUrl?.replace(/\/$/, "") ?? "http://localhost:3000"}/en`;
}

export default async function AdminPage() {
  const [orders, paymentMethods] = await Promise.all([
    listPersistedAdminOrders(),
    getAdminPaymentMethods(),
  ]);

  return (
    <AdminDashboard
      initialOrders={orders}
      paymentMethods={paymentMethods}
      storefrontUrl={getStorefrontUrl()}
    />
  );
}

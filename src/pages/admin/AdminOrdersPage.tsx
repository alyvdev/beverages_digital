import { Layout } from "@/components/layout/Layout";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function AdminOrdersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <OrdersTable />
      </Layout>
    </ProtectedRoute>
  );
}

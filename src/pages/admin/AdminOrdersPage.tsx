import { Layout } from "@/components/layout/Layout";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function AdminOrdersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>
        <OrdersTable />
      </Layout>
    </ProtectedRoute>
  );
}

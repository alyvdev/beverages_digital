import { Layout } from "@/components/layout/Layout";
import { MenuItemTable } from "@/components/admin/MenuItemTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function AdminMenuPage() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <h1 className="text-2xl font-bold mb-6">Menu Management</h1>
        <MenuItemTable />
      </Layout>
    </ProtectedRoute>
  );
}

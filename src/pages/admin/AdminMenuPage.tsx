import { Layout } from "@/components/layout/Layout";
import { MenuItemTable } from "@/components/admin/MenuItemTable";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export function AdminMenuPage() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <MenuItemTable />
      </Layout>
    </ProtectedRoute>
  );
}

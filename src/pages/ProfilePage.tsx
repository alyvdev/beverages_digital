import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, Package, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
}

export function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders data
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll just set an empty array
    setTimeout(() => {
      setOrders([]);
      setIsLoading(false);
    }, 300);
  }, []);

  return (
    <Layout>
      <div className="container-responsive py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 text-center border-b border-border">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user?.email?.split('@')[0] || "User"}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center mt-1">
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  {user?.email || "user@example.com"}
                </p>
                {isAdmin && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Admin
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <nav className="space-y-1">
                  <Link to="/profile" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary">
                    <User className="mr-3 h-5 w-5" />
                    Profile
                  </Link>
                  <Link to="/orders" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors">
                    <Package className="mr-3 h-5 w-5" />
                    My Orders
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admin/menu" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                          <path d="M3 7h18"></path>
                          <path d="M3 12h18"></path>
                          <path d="M3 17h12"></path>
                        </svg>
                        Manage Menu
                      </Link>
                      <Link to="/admin/orders" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="M7 15h0"></path>
                          <path d="M12 15h0"></path>
                          <path d="M17 15h0"></path>
                        </svg>
                        Manage Orders
                      </Link>
                    </>
                  )}
                </nav>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3 lg:w-3/4 space-y-6">
            {/* Profile Overview */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{orders.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Orders</h3>
                  <Link to="/orders" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    View All
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4">{order.id}</td>
                            <td className="py-3 px-4">{order.date}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">${order.total.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <Link
                                to={`/order-confirmation/${order.id}`}
                                className="text-primary hover:text-primary/80 text-sm"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/30 rounded-lg border border-border">
                    <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                    <Link to="/" className="mt-4 inline-block text-primary hover:text-primary/80">
                      Browse Menu
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

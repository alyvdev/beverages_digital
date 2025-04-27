import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types";
import { ordersApi } from "@/lib/api";
import { OrderDetailsModal } from "./OrderDetailsModal";

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PREPARING:
        return "bg-amber-100 text-amber-800";
      case OrderStatus.READY:
        return "bg-green-100 text-green-800";
      case OrderStatus.COMPLETED:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.CANCELED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Orders</h2>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 border-b border-border">Order ID</th>
                <th className="text-right p-3 border-b border-border">Total Price</th>
                <th className="text-center p-3 border-b border-border">Status</th>
                <th className="text-left p-3 border-b border-border">Date</th>
                <th className="text-center p-3 border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="p-3 border-b border-border">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="p-3 border-b border-border text-right">
                    ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : order.total_price}
                  </td>
                  <td className="p-3 border-b border-border">
                    <div className="flex justify-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 border-b border-border">
                    {/* Assuming there's a timestamp field in the order */}
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b border-border">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

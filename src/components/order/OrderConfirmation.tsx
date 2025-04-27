import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { ordersApi } from "@/lib/api";

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const data = await ordersApi.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p>{error || "Order not found"}</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            Return to Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-card p-6 rounded-lg border border-border">
      <div className="flex flex-col items-center mb-6">
        <CheckCircle className="text-green-500 h-16 w-16 mb-2" />
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <p className="text-muted-foreground">
          Your order has been successfully placed.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-sm text-muted-foreground">Order ID</p>
          <p className="font-medium">{order.id}</p>
        </div>
        <div className="flex justify-between mb-2">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium capitalize">{order.status}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-bold">${typeof order.total_price === 'number'
            ? order.total_price.toFixed(2)
            : parseFloat(String(order.total_price)).toFixed(2)}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-6">
        <h3 className="font-medium mb-2">Order Items</h3>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
            >
              <div>
                <p className="font-medium">Item ID: {item.menu_item_id}</p>
                <p className="text-sm text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p>${(typeof item.price_at_order === 'number'
                  ? item.price_at_order * item.quantity
                  : parseFloat(String(item.price_at_order)) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link to="/">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

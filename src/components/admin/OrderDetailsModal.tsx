import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-bold">Order Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <div className="border-t border-border pt-4 mt-4">
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
                    <p>${typeof item.price_at_order === 'number' ? item.price_at_order.toFixed(2) : item.price_at_order} each</p>
                    <p className="font-medium">
                      ${typeof item.price_at_order === 'number' ? (item.price_at_order * item.quantity).toFixed(2) : item.price_at_order}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <div className="flex justify-between items-center">
              <p className="font-medium">Total</p>
              <p className="font-bold text-lg">
                ${typeof order.total_price === 'number' ? order.total_price.toFixed(2) : order.total_price}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

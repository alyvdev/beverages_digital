import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { ordersApi } from "@/lib/api";

export function CartSummary() {
  const { totalItems, totalPrice, getOrderItems, clearCart } = useCart();
  const { incrementCustomers } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (totalItems === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: getOrderItems(),
      };

      const response = await ordersApi.create(orderData);

      // Sipariş başarıyla oluşturulduğunda müşteri sayısını 1 artır
      incrementCustomers(1); // Sabit 1 değeri kullanıldı

      clearCart();
      navigate(`/order-confirmation/${response.id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Items ({totalItems})</span>
          <span>
            $
            {typeof totalPrice === "number"
              ? totalPrice.toFixed(2)
              : totalPrice}
          </span>
        </div>

        <div className="border-t border-border pt-2 font-medium flex justify-between">
          <span>Total</span>
          <span>
            $
            {typeof totalPrice === "number"
              ? totalPrice.toFixed(2)
              : totalPrice}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <Button
        className="w-full"
        disabled={totalItems === 0 || isSubmitting}
        onClick={handleCheckout}
      >
        {isSubmitting ? "Processing..." : "Checkout"}
      </Button>

      <Button
        variant="outline"
        className="w-full mt-2"
        disabled={totalItems === 0 || isSubmitting}
        onClick={clearCart}
      >
        Clear Cart
      </Button>
    </div>
  );
}

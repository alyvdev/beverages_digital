import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi } from "@/lib/api";

export function CartSummary() {
  const { totalItems, totalPrice, getOrderItems, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (totalItems === 0) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        items: getOrderItems(),
      };

      const response = await ordersApi.create(orderData);
      clearCart();
      navigate(`/order-confirmation/${response.id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      if (err instanceof Error &&
          (err.message.includes("401") ||
           err.message.includes("credentials"))) {
        setError("Authentication required. Please log in to complete your order.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to place order");
      }
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
          <span>${typeof totalPrice === 'number' ? totalPrice.toFixed(2) : totalPrice}</span>
        </div>

        <div className="border-t border-border pt-2 font-medium flex justify-between">
          <span>Total</span>
          <span>${typeof totalPrice === 'number' ? totalPrice.toFixed(2) : totalPrice}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      {isAuthenticated ? (
        <Button
          className="w-full"
          disabled={totalItems === 0 || isSubmitting}
          onClick={handleCheckout}
        >
          {isSubmitting ? "Processing..." : "Checkout"}
        </Button>
      ) : (
        <Link to="/login" className="block w-full">
          <Button className="w-full">
            Login to Checkout
          </Button>
        </Link>
      )}

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

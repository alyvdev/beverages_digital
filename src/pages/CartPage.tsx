import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export function CartPage() {
  const { items, totalItems } = useCart();

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {totalItems === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-medium">Cart Items ({totalItems})</h2>
              </div>
              <div className="p-4">
                {items.map((item) => (
                  <CartItem
                    key={item.menuItem.id}
                    menuItem={item.menuItem}
                    quantity={item.quantity}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </Layout>
  );
}

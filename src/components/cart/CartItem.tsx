import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  menuItem: MenuItem;
  quantity: number;
}

export function CartItem({ menuItem, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleIncrement = () => {
    updateQuantity(menuItem.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(menuItem.id, quantity - 1);
    } else {
      removeItem(menuItem.id);
    }
  };

  const handleRemove = () => {
    removeItem(menuItem.id);
  };

  // Ensure final_price is treated as a number
  const finalPrice =
    typeof menuItem.final_price === "number"
      ? menuItem.final_price
      : parseFloat(String(menuItem.final_price));

  const itemTotal = finalPrice * quantity;

  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <div className="flex-1">
        <h3 className="font-medium">{menuItem.name}</h3>
        <p className="text-sm text-muted-foreground">
          {menuItem.category.name}
        </p>
        <p className="text-sm">
          $
          {typeof menuItem.final_price === "number"
            ? menuItem.final_price.toFixed(2)
            : parseFloat(String(menuItem.final_price)).toFixed(2)}{" "}
          each
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border border-input rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none rounded-l-md"
            onClick={handleDecrement}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="w-8 text-center">{quantity}</span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none rounded-r-md"
            onClick={handleIncrement}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-20 text-right">${itemTotal.toFixed(2)}</div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

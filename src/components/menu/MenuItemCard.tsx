import { Plus, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useModal } from "@/hooks/useModal";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();

  // Try to use the modal system, but provide a fallback if it's not available
  let modalSystem;
  try {
    modalSystem = useModal();
  } catch (error) {
    console.warn("Modal system not available:", error);
    modalSystem = {
      openModal: () =>
        alert("Price history feature is not available at the moment."),
    };
  }

  const handleAddToCart = () => {
    addItem(item);
  };

  const showPriceHistory = () => {
    try {
      modalSystem.openModal("priceHistory", {
        itemId: item.id,
        itemName: item.name,
      });
    } catch (error) {
      console.error("Failed to open price history modal:", error);
      alert(`Price history for ${item.name} is not available at the moment.`);
    }
  };

  // Determine if the item is active
  const isActive = item.is_active !== false;

  return (
    <div
      className={`group bg-card rounded-xl shadow-sm overflow-hidden border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      {/* Placeholder for image - in a real app, you'd use a real image */}
      <div className="h-40 bg-gradient-to-br from-primary/5 to-accent/10 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-30">🥤</span>
        </div>

        {/* Category badge */}
        <span className="absolute top-3 right-3 bg-card text-foreground text-xs px-3 py-1 rounded-full shadow-sm border border-border">
          {item.category.name}
        </span>

        {/* Status badge for inactive items */}
        {!isActive && (
          <span className="absolute top-3 left-3 bg-destructive/80 text-destructive-foreground text-xs px-3 py-1 rounded-full shadow-sm">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {item.name}
        </h3>

        <div className="space-y-4">
          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                $
                {typeof item.final_price === "number"
                  ? item.final_price.toFixed(2)
                  : item.final_price}
              </p>
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              className="rounded-full shadow-sm"
              disabled={!isActive}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>

          <button
            onClick={showPriceHistory}
            className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors py-1.5 border border-border/50 rounded-md"
          >
            <LineChart className="h-3 w-3" />
            View Price History
          </button>
        </div>
      </div>
    </div>
  );
}

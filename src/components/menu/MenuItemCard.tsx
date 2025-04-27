import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem } = useCart();
  const { isDarkMode } = useTheme();

  const handleAddToCart = () => {
    addItem(item);
  };

  // Determine if the coefficient is high or low
  const isHighCoefficient = typeof item.coefficient === 'number' && item.coefficient > 1.1;
  const isLowCoefficient = typeof item.coefficient === 'number' && item.coefficient < 0.9;

  // Determine if the item is active
  const isActive = item.is_active !== false;

  // Get coefficient trend icon
  const getCoefficientIcon = () => {
    if (isHighCoefficient) return <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
    if (isLowCoefficient) return <TrendingDown className="h-3.5 w-3.5 text-green-500" />;
    return null;
  };

  return (
    <div className={`group bg-card rounded-xl shadow-sm overflow-hidden border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${!isActive ? 'opacity-60' : ''}`}>
      {/* Placeholder for image - in a real app, you'd use a real image */}
      <div className="h-40 bg-gradient-to-br from-primary/5 to-accent/10 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-30">🥤</span>
        </div>

        {/* Category badge */}
        <span className="absolute top-3 right-3 bg-card text-foreground text-xs px-3 py-1 rounded-full shadow-sm border border-border">
          {item.category}
        </span>

        {/* Status badge for inactive items */}
        {!isActive && (
          <span className="absolute top-3 left-3 bg-destructive/80 text-destructive-foreground text-xs px-3 py-1 rounded-full shadow-sm">
            Unavailable
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.name}</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Base price</p>
              <p className="text-foreground">${typeof item.base_price === 'number' ? item.base_price.toFixed(2) : item.base_price}</p>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                <span>Coefficient</span>
                {getCoefficientIcon()}
              </div>
              <p className={`font-medium ${
                isHighCoefficient ? 'text-destructive' :
                isLowCoefficient ? 'text-green-500' :
                'text-foreground'
              }`}>
                {typeof item.coefficient === 'number' ? item.coefficient.toFixed(2) : item.coefficient}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Final price</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ${typeof item.final_price === 'number' ? item.final_price.toFixed(2) : item.final_price}
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
        </div>
      </div>
    </div>
  );
}

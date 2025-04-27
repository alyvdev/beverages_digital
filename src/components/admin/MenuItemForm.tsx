import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MenuItem, MenuItemCreate, MenuItemUpdate } from "@/types";
import { menuItemsApi } from "@/lib/api";

interface MenuItemFormProps {
  item?: MenuItem;
  onSuccess: () => void;
}

export function MenuItemForm({ item, onSuccess }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState(item?.category || "");
  const [basePrice, setBasePrice] = useState(
    item ? (typeof item.base_price === 'number' ? item.base_price.toString() : item.base_price) : ""
  );
  const [coefficient, setCoefficient] = useState(
    item ? (typeof item.coefficient === 'number' ? item.coefficient.toString() : item.coefficient) : "1.0"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!item;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const basePriceNum = parseFloat(basePrice);

      if (isNaN(basePriceNum) || basePriceNum <= 0) {
        throw new Error("Base price must be a positive number");
      }

      if (isEditing && item) {
        const coefficientNum = parseFloat(coefficient);

        if (isNaN(coefficientNum) || coefficientNum < 0.8 || coefficientNum > 2.0) {
          throw new Error("Coefficient must be between 0.8 and 2.0");
        }

        const updateData: MenuItemUpdate = {
          name: name !== item.name ? name : undefined,
          category: category !== item.category ? category : undefined,
          base_price: basePriceNum !== item.base_price ? basePriceNum : undefined,
          coefficient: coefficientNum !== item.coefficient ? coefficientNum : undefined,
        };

        await menuItemsApi.update(item.id, updateData);
      } else {
        const createData: MenuItemCreate = {
          name,
          category,
          base_price: basePriceNum,
        };

        await menuItemsApi.create(createData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      <div>
        <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
          Base Price ($)
        </label>
        <input
          id="basePrice"
          type="number"
          min="0.01"
          step="0.01"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          required
        />
      </div>

      {isEditing && (
        <div>
          <label htmlFor="coefficient" className="block text-sm font-medium mb-1">
            Coefficient (0.8 - 2.0)
          </label>
          <input
            id="coefficient"
            type="number"
            min="0.8"
            max="2.0"
            step="0.01"
            value={coefficient}
            onChange={(e) => setCoefficient(e.target.value)}
            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEditing
            ? "Update Item"
            : "Create Item"}
        </Button>
      </div>
    </form>
  );
}

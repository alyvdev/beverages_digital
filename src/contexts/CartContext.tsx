import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { MenuItem, OrderItemCreate } from "@/types";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getOrderItems: () => OrderItemCreate[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "beverages_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.menuItem.id === menuItem.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { menuItem, quantity }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.menuItem.id !== menuItemId)
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.menuItem.final_price * item.quantity,
    0
  );

  const getOrderItems = (): OrderItemCreate[] => {
    return items.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
    }));
  };

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getOrderItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

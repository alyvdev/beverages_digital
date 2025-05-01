import { MenuItem, OrderItemCreate } from "@/types";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getOrderItems: () => OrderItemCreate[];
}

export const CART_STORAGE_KEY = "beverates_cart";

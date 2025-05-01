// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  base_price: number;
  coefficient: number;
  final_price: number;
  is_active?: boolean;
}

export interface MenuItemCreate {
  name: string;
  category_id: string;
  base_price: number;
}

export interface MenuItemUpdate {
  name?: string;
  category_id?: string;
  base_price?: number;
  coefficient?: number;
  is_active?: boolean;
}

// Order Types
export interface OrderItemCreate {
  menu_item_id: string;
  quantity: number;
}

export interface OrderCreate {
  items: OrderItemCreate[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  price_at_order: number;
  quantity: number;
}

export enum OrderStatus {
  RECEIVED = "received",
  PREPARING = "preparing",
  READY = "ready",
  COMPLETED = "completed",
  CANCELED = "cancelled",
}

export interface OrderSimple {
  id: string;
  total_price: number;
  status: OrderStatus;
}

export interface Order extends OrderSimple {
  items: OrderItem[];
}

// Coefficient Log Types
export enum ChangeReason {
  ORDERED = "ordered",
  DECAYED = "decayed",
  MANUAL_UPDATE = "manual_update",
  CREATED = "created",
}

export interface CoefficientLog {
  id: string;
  item_id: string;
  timestamp: string;
  previous_coefficient: number;
  new_coefficient: number;
  change_reason: ChangeReason;
  menu_item: MenuItem;
}

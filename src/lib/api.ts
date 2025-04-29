import {
  LoginRequest,
  LoginResponse,
  MenuItem,
  MenuItemCreate,
  MenuItemUpdate,
  OrderCreate,
  Order,
  OrderSimple,
  CoefficientLog,
} from "@/types";

// Use the correct API URL
const API_URL = "http://localhost:8000";

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  data?: unknown
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies in the request
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    // Log response headers for debugging
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error codes
      if (response.status === 401) {
        // Check if user is logged in
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          // If this is not a refresh token request, try to refresh the token
          if (endpoint !== "/auth/refresh") {
            try {
              // Try to refresh the token
              await apiRequest("/auth/refresh", "POST");

              // If refresh succeeds, retry the original request
              return await apiRequest(endpoint, method, data);
            } catch {
              // If refresh fails, clear user data and throw error
              localStorage.removeItem("userEmail");
              document.cookie =
                "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie =
                "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

              // Force page reload to update auth state
              window.location.href = "/login";

              throw new Error("Session expired: Please log in again");
            }
          } else {
            // This is already a refresh token request that failed
            throw new Error(
              errorData.detail ||
                "Authentication failed: Please log out and log in again"
            );
          }
        } else {
          throw new Error(
            errorData.detail ||
              "Authentication required: Please log in to continue"
          );
        }
      } else if (response.status === 400) {
        throw new Error(
          errorData.detail ||
            "Bad request: The server could not process your request"
        );
      } else if (response.status === 404) {
        throw new Error(
          errorData.detail || "Not found: The requested resource does not exist"
        );
      } else if (response.status === 500) {
        throw new Error(
          errorData.detail || "Server error: Something went wrong on the server"
        );
      }

      throw new Error(
        errorData.detail || `Error ${response.status}: ${response.statusText}`
      );
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    apiRequest<LoginResponse>("/auth/login", "POST", data),

  refresh: () => apiRequest<LoginResponse>("/auth/refresh", "POST"),
};

// Menu Items API
export const menuItemsApi = {
  getAll: () => apiRequest<MenuItem[]>("/menu"),

  getById: (id: string) => apiRequest<MenuItem>(`/menu/item?item_id=${id}`),

  create: (data: MenuItemCreate) => apiRequest<void>("/menu", "POST", data),

  update: (id: string, data: MenuItemUpdate) =>
    apiRequest<MenuItem>(`/menu?item_id=${id}`, "PATCH", data),

  delete: (id: string) => apiRequest<void>(`/menu?item_id=${id}`, "DELETE"),

  disable: (id: string) =>
    apiRequest<MenuItem>(`/menu?item_id=${id}`, "PATCH", { is_active: false }),

  enable: (id: string) =>
    apiRequest<MenuItem>(`/menu?item_id=${id}`, "PATCH", { is_active: true }),
};

// Orders API
export const ordersApi = {
  create: (data: OrderCreate) =>
    apiRequest<OrderSimple>("/order", "POST", data),

  getById: (id: string) => apiRequest<Order>(`/order?order_id=${id}`),

  getAll: () => apiRequest<Order[]>("/orders"),

  updateStatus: (id: string, status: string) =>
    apiRequest<Order>(`/order/status?order_id=${id}`, "PATCH", { status }),
};

// Coefficient Log API
export const coefficientLogApi = {
  getByItemId: (itemId: string) =>
    apiRequest<CoefficientLog>(`/coefficient?item_id=${itemId}`),

  getHistoryByItemId: (itemId: string) =>
    apiRequest<CoefficientLog[]>(`/coefficient/history?item_id=${itemId}`),
};

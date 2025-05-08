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

const API_URL = "http://localhost:8000";

async function loginRequest(data: LoginRequest): Promise<LoginResponse> {
  const url = `${API_URL}/auth/login`;
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Login failed: ${response.statusText}`);
  }

  return response.json() as Promise<LoginResponse>;
}

async function refreshTokenRequest(): Promise<LoginResponse> {
  const url = `${API_URL}/auth/refresh`;
  const options: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Token refresh failed: ${response.statusText}`
    );
  }

  return response.json() as Promise<LoginResponse>;
}

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
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          if (endpoint !== "/auth/refresh") {
            try {
              await refreshTokenRequest();

              return await apiRequest(endpoint, method, data);
            } catch {
              // Clear local storage
              localStorage.removeItem("userEmail");
              localStorage.removeItem("authTimestamp");

              // Let the server handle cookie deletion by calling logout endpoint
              try {
                await apiRequest<{ message: string }>("/auth/logout", "POST");
              } catch (logoutError) {
                console.error("Failed to logout properly:", logoutError);
              }

              // Redirect to login page
              window.location.href = "/login";

              throw new Error("Session expired: Please log in again");
            }
          } else {
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
      } else if (response.status === 422) {
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const errors = errorData.detail
            .map((err: { loc?: string[]; msg: string }) => {
              if (err.loc && err.loc.length > 1) {
                return `${err.loc[1]}: ${err.msg}`;
              }
              return err.msg;
            })
            .join(", ");
          throw new Error(`Validation error: ${errors}`);
        } else {
          throw new Error(
            errorData.detail || "Validation error: Please check your input"
          );
        }
      } else if (response.status === 500) {
        throw new Error(
          errorData.detail || "Server error: Something went wrong on the server"
        );
      }

      throw new Error(
        errorData.detail || `Error ${response.status}: ${response.statusText}`
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);

    if (error instanceof Error) {
      throw error;
    }

    if (typeof error === "object" && error !== null) {
      throw new Error(JSON.stringify(error));
    }

    throw new Error(`API request failed: ${String(error)}`);
  }
}

export const authApi = {
  login: (data: LoginRequest) => loginRequest(data),
  refresh: () => refreshTokenRequest(),
  logout: () => apiRequest<{ message: string }>("/auth/logout", "POST"),
};

export const menuItemsApi = {
  getAll: () =>
    apiRequest<{
      items: MenuItem[];
      total: number;
      page: number;
      page_size: number;
      pages: number;
    }>("/menu"),

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

export const ordersApi = {
  create: (data: OrderCreate) =>
    apiRequest<OrderSimple>("/order", "POST", data),

  getById: (id: string) => apiRequest<Order>(`/order?order_id=${id}`),

  getAll: (page: number = 1, pageSize: number = 10) =>
    apiRequest<{
      items: Order[];
      total: number;
      page: number;
      page_size: number;
      pages: number;
    }>(`/orders?page=${page}&page_size=${pageSize}`),

  updateStatus: (id: string, status: string) =>
    apiRequest<Order>(`/order/status?order_id=${id}`, "PATCH", { status }),
};

export const coefficientLogApi = {
  getByItemId: (itemId: string) =>
    apiRequest<CoefficientLog>(`/coefficient?item_id=${itemId}`),

  getHistoryByItemId: (itemId: string) =>
    apiRequest<CoefficientLog[]>(`/coefficient/history?item_id=${itemId}`),

  getPublicHistoryByItemId: (itemId: string) =>
    apiRequest<CoefficientLog[]>(
      `/coefficient/public/history?item_id=${itemId}`
    ),
};

export const categoriesApi = {
  getAll: () => apiRequest<{ id: string; name: string }[]>("/categories"),

  getById: (id: string) =>
    apiRequest<{ id: string; name: string }>(`/category?category_id=${id}`),

  create: (name: string) => apiRequest<void>("/category", "POST", { name }),
};

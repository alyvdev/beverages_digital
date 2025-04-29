import { useState, useEffect } from "react";
import { Eye, ChevronDown, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/types";
import { ordersApi } from "@/lib/api";
import { OrderDetailsModal } from "./OrderDetailsModal";

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Add click outside handler to close dropdowns and filter panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle status dropdown click outside
      if (
        openDropdownId &&
        !(
          (event.target as Element).closest(
            `#status-dropdown-${openDropdownId}`
          ) ||
          (event.target as Element).closest(`#status-trigger-${openDropdownId}`)
        )
      ) {
        setOpenDropdownId(null);
      }

      // Handle filter panel click outside
      if (
        isFilterOpen &&
        !(
          (event.target as Element).closest("#filter-panel") ||
          (event.target as Element).closest("#filter-toggle-button")
        )
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId, isFilterOpen]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    if (updatingOrderId) return; // Prevent multiple simultaneous updates

    setUpdatingOrderId(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus);

      // Update the local state to reflect the change
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Show success message (optional)
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update order status:", err);
      // Show error message (optional)
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    // Filter by search query (check if order ID contains the search query)
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Return true if both conditions are met
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PREPARING:
        return "bg-amber-100 text-amber-800";
      case OrderStatus.READY:
        return "bg-green-100 text-green-800";
      case OrderStatus.COMPLETED:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.CANCELED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Orders</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            Refresh
          </Button>
          <Button
            id="filter-toggle-button"
            variant="outline"
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {isFilterOpen && (
        <div
          id="filter-panel"
          className="mb-4 p-4 bg-background border border-border rounded-lg animate-fade-in"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-[200px]">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as OrderStatus | "all")
                  }
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none pr-8"
                >
                  <option value="all">All Statuses</option>
                  {Object.values(OrderStatus).map((status) => (
                    <option
                      key={status}
                      value={status}
                      className="bg-background text-foreground"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-8 bg-background rounded-lg border border-border">
          <p className="text-muted-foreground">No orders match your filters</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="mt-2 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="mb-2 text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="ml-2 text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 border-b border-border">
                  Order ID
                </th>
                <th className="text-right p-3 border-b border-border">
                  Total Price
                </th>
                <th className="text-center p-3 border-b border-border">
                  Status
                </th>
                <th className="text-left p-3 border-b border-border">Date</th>
                <th className="text-center p-3 border-b border-border">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="p-3 border-b border-border">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="p-3 border-b border-border text-right">
                    $
                    {typeof order.total_price === "number"
                      ? order.total_price.toFixed(2)
                      : order.total_price}
                  </td>
                  <td className="p-3 border-b border-border">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div
                          id={`status-trigger-${order.id}`}
                          className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer ${getStatusColor(
                            order.status
                          )}`}
                          onClick={() => {
                            setOpenDropdownId(
                              openDropdownId === order.id ? null : order.id
                            );
                          }}
                        >
                          {order.status}
                          <ChevronDown className="h-3 w-3" />
                        </div>

                        {/* Status Dropdown */}
                        <div
                          id={`status-dropdown-${order.id}`}
                          className={`absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-background border border-border ${
                            openDropdownId === order.id ? "" : "hidden"
                          }`}
                        >
                          <div className="py-1">
                            {Object.values(OrderStatus).map((status) => (
                              <button
                                key={status}
                                className={`w-full text-left px-3 py-2 text-xs text-foreground ${
                                  order.status === status
                                    ? "bg-muted font-medium"
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => {
                                  if (order.status !== status) {
                                    handleStatusChange(order.id, status);
                                  }
                                  setOpenDropdownId(null);
                                }}
                                disabled={updatingOrderId === order.id}
                              >
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusColor(
                                    status
                                  )}`}
                                ></span>
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b border-border">
                    {/* Assuming there's a timestamp field in the order */}
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="p-3 border-b border-border">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

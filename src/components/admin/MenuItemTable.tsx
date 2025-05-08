import { useState, useEffect } from "react";
import { Edit, BarChart2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types";
import { menuItemsApi } from "@/lib/api";
import { MenuItemForm } from "./MenuItemForm";
import { CoefficientLogModal } from "./CoefficientLogModal";

export function MenuItemTable() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCoefficientLog, setShowCoefficientLog] = useState<string | null>(
    null
  );

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await menuItemsApi.getAll();
      // Extract the items array from the pagination response
      const menuItemsArray = Array.isArray(response.items)
        ? response.items
        : [];
      setMenuItems(menuItemsArray);
    } catch (err) {
      setError("Failed to load menu items");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleDeleteItem = async (item: MenuItem) => {
    const confirmMessage = `Are you sure you want to delete "${item.name}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await menuItemsApi.delete(item.id);

      // Remove the item from the list
      setMenuItems((items) => items.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Error deleting menu item:", err);

      // Provide more specific error messages based on the error
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (
          errorMsg.includes("authentication") ||
          errorMsg.includes("credentials") ||
          errorMsg.includes("log in") ||
          errorMsg.includes("401")
        ) {
          setError(
            "Authentication required: You need to be logged in as an admin to delete menu items. " +
              "Please log out and log in again with admin credentials."
          );
        } else {
          setError(`Failed to delete item: ${err.message}`);
        }
      } else {
        setError("Failed to delete item due to an unknown error.");
      }
    }
  };

  const handleFormSuccess = () => {
    setEditingItem(null);
    setShowCreateForm(false);
    fetchMenuItems();
  };

  if (isLoading && menuItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading menu items...</p>
      </div>
    );
  }

  // Table rendering function
  const renderMenuItemsTable = () => {
    if (menuItems.length === 0) {
      return (
        <div className="text-center py-8 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No menu items found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowCreateForm(true)}
          >
            Create your first menu item
          </Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="text-left p-3 border-b border-border">Name</th>
              <th className="text-left p-3 border-b border-border">Category</th>
              <th className="text-right p-3 border-b border-border">
                Base Price
              </th>
              <th className="text-right p-3 border-b border-border">
                Coefficient
              </th>
              <th className="text-right p-3 border-b border-border">
                Final Price
              </th>
              <th className="text-center p-3 border-b border-border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-muted/50 ${
                  item.is_active === false
                    ? "bg-muted/30 text-muted-foreground"
                    : ""
                }`}
              >
                <td className="p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    {item.name}
                    {item.is_active === false && (
                      <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 border-b border-border">
                  {item.category.name}
                </td>
                <td className="p-3 border-b border-border text-right">
                  $
                  {typeof item.base_price === "number"
                    ? item.base_price.toFixed(2)
                    : item.base_price}
                </td>
                <td className="p-3 border-b border-border text-right">
                  {typeof item.coefficient === "number"
                    ? item.coefficient.toFixed(2)
                    : item.coefficient}
                </td>
                <td className="p-3 border-b border-border text-right">
                  $
                  {typeof item.final_price === "number"
                    ? item.final_price.toFixed(2)
                    : item.final_price}
                </td>
                <td className="p-3 border-b border-border">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCoefficientLog(item.id)}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteItem(item)}
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (error) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu Items</h2>
          <Button onClick={() => setShowCreateForm(true)}>Add New Item</Button>
        </div>

        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md mb-4">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>

        {/* Still show the table even if there's an error */}
        {renderMenuItemsTable()}
      </div>
    );
  }

  if (editingItem) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-4">Edit Menu Item</h2>
        <MenuItemForm item={editingItem} onSuccess={handleFormSuccess} />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-4">Create Menu Item</h2>
        <MenuItemForm onSuccess={handleFormSuccess} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Menu Items</h2>
        <Button onClick={() => setShowCreateForm(true)}>Add New Item</Button>
      </div>

      {renderMenuItemsTable()}

      {showCoefficientLog && (
        <CoefficientLogModal
          itemId={showCoefficientLog}
          onClose={() => setShowCoefficientLog(null)}
        />
      )}
    </div>
  );
}

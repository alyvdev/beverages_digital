import { useState, useEffect } from "react";
import { Edit, BarChart2 } from "lucide-react";
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
  const [showCoefficientLog, setShowCoefficientLog] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const items = await menuItemsApi.getAll();
      setMenuItems(items);
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

  const handleToggleActive = async (item: MenuItem) => {
    const action = item.is_active ? "disable" : "enable";
    const confirmMessage = item.is_active
      ? "Are you sure you want to disable this item? It will no longer appear in the menu for customers."
      : "Are you sure you want to enable this item? It will appear in the menu for customers.";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Use disable or enable based on current state
      const updatedItem = item.is_active
        ? await menuItemsApi.disable(item.id)
        : await menuItemsApi.enable(item.id);

      // Update the item in the list
      setMenuItems((items) =>
        items.map((i) => (i.id === item.id ? updatedItem : i))
      );
    } catch (err) {
      console.error(`Error ${action}ing menu item:`, err);

      // Provide more specific error messages based on the error
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (errorMsg.includes("authentication") ||
            errorMsg.includes("credentials") ||
            errorMsg.includes("log in") ||
            errorMsg.includes("401")) {
          setError(
            `Authentication required: You need to be logged in as an admin to ${action} menu items. ` +
            "Please log out and log in again with admin credentials."
          );
        } else {
          setError(`Failed to ${action} item: ${err.message}`);
        }
      } else {
        setError(`Failed to ${action} item due to an unknown error.`);
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
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="text-left p-3 border-b border-border">Name</th>
              <th className="text-left p-3 border-b border-border">Category</th>
              <th className="text-right p-3 border-b border-border">Base Price</th>
              <th className="text-right p-3 border-b border-border">Coefficient</th>
              <th className="text-right p-3 border-b border-border">Final Price</th>
              <th className="text-center p-3 border-b border-border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-muted/50 ${item.is_active === false ? 'bg-muted/30 text-muted-foreground' : ''}`}
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
                <td className="p-3 border-b border-border">{item.category}</td>
                <td className="p-3 border-b border-border text-right">
                  ${typeof item.base_price === 'number' ? item.base_price.toFixed(2) : item.base_price}
                </td>
                <td className="p-3 border-b border-border text-right">
                  {typeof item.coefficient === 'number' ? item.coefficient.toFixed(2) : item.coefficient}
                </td>
                <td className="p-3 border-b border-border text-right">
                  ${typeof item.final_price === 'number' ? item.final_price.toFixed(2) : item.final_price}
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
                      className={item.is_active === false
                        ? "text-muted-foreground hover:text-green-600"
                        : "text-muted-foreground hover:text-amber-600"}
                      onClick={() => handleToggleActive(item)}
                      title={item.is_active === false ? "Enable item" : "Disable item"}
                    >
                      {item.is_active === false ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                        </svg>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCoefficientLog(item.id)}
                    >
                      <BarChart2 className="h-4 w-4" />
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
            >
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { menuItemsApi } from "@/lib/api";
import { MenuItem } from "@/types";
import { MenuItemCard } from "./MenuItemCard";
import { useAuth } from "@/contexts/AuthContext";

export function MenuList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await menuItemsApi.getAll();
        setMenuItems(items);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(items.map((item) => item.category))
        );
        setCategories(uniqueCategories);
        setIsAuthError(false);
      } catch (err) {
        console.error("Error fetching menu items:", err);

        // Check if it's an authentication error (401)
        if (err instanceof Error &&
            (err.message.includes("401") ||
             err.message.includes("credentials"))) {
          setIsAuthError(true);
          setError("Authentication required to view menu items");
        } else {
          setError("Failed to load menu items");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg shadow-sm animate-fade-in">
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p>{error}</p>

        {isAuthError && !isAuthenticated && (
          <div className="mt-6">
            <p className="mb-3">Please log in to view the menu items.</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-sm"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Menu
          </h1>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-30 rounded-full"></div>
            <div className="relative bg-card border border-border rounded-full shadow-sm p-1">
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === null
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-secondary/80"
                  }`}
                >
                  All
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-secondary/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedCategory && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-xl font-medium text-foreground/80">
              Category: <span className="text-primary">{selectedCategory}</span>
            </h2>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MenuItemCard item={item} />
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border animate-fade-in">
          <p className="text-muted-foreground mb-2">No menu items found</p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            View all items
          </button>
        </div>
      )}
    </div>
  );
}

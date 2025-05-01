import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MenuItem, MenuItemCreate, MenuItemUpdate } from "@/types";
import { menuItemsApi, categoriesApi } from "@/lib/api";

interface MenuItemFormProps {
  item?: MenuItem;
  onSuccess: () => void;
}

export function MenuItemForm({ item, onSuccess }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [categoryName, setCategoryName] = useState(item?.category?.name || "");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    item?.category?.id || ""
  );
  const [basePrice, setBasePrice] = useState(
    item
      ? typeof item.base_price === "number"
        ? item.base_price.toString()
        : item.base_price
      : ""
  );
  const [coefficient, setCoefficient] = useState(
    item
      ? typeof item.coefficient === "number"
        ? item.coefficient.toString()
        : item.coefficient
      : "1.0"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isEditing = !!item;

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      categorySearch === "" ||
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        !(event.target as Element).closest(".category-dropdown")
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await categoriesApi.getAll();
        setCategories(categoriesData);

        // If we have an item being edited, set the selected category ID
        if (item && item.category) {
          setSelectedCategoryId(item.category.id);
          setIsNewCategory(false);
        } else if (categoriesData.length > 0) {
          // For new items, select the first category by default if available
          setSelectedCategoryId(categoriesData[0].id);
          setCategoryName(categoriesData[0].name);
          setIsNewCategory(false);
        } else {
          // If no categories exist, default to creating a new one
          setIsNewCategory(true);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [item]);

  // Find category ID based on name
  const findCategoryId = (name: string): string | undefined => {
    const category = categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase()
    );
    return category?.id;
  };

  // Create a new category if it doesn't exist
  const createCategoryIfNeeded = async (name: string): Promise<string> => {
    // Check if category already exists
    const existingId = findCategoryId(name);
    if (existingId) {
      return existingId;
    }

    // Create new category
    try {
      await categoriesApi.create(name);
      // Fetch updated categories to get the new ID
      const updatedCategories = await categoriesApi.getAll();
      setCategories(updatedCategories);

      // Find and return the new ID
      const newCategory = updatedCategories.find(
        (cat) => cat.name.toLowerCase() === name.toLowerCase()
      );
      if (!newCategory) {
        throw new Error("Failed to create category");
      }
      return newCategory.id;
    } catch (err) {
      console.error("Error creating category:", err);
      throw new Error("Failed to create category");
    }
  };

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

        if (
          isNaN(coefficientNum) ||
          coefficientNum < 0.8 ||
          coefficientNum > 2.0
        ) {
          throw new Error("Coefficient must be between 0.8 and 2.0");
        }

        // Determine the category ID to use
        let categoryId = item.category.id;

        if (isNewCategory) {
          // Create a new category if needed
          try {
            categoryId = await createCategoryIfNeeded(categoryName);
          } catch (err) {
            throw new Error(
              "Failed to create new category: " +
                (err instanceof Error ? err.message : String(err))
            );
          }
        } else {
          // Use the selected existing category
          categoryId = selectedCategoryId;
        }

        const updateData: MenuItemUpdate = {
          name: name !== item.name ? name : undefined,
          category_id: categoryId !== item.category.id ? categoryId : undefined,
          base_price:
            basePriceNum !== item.base_price ? basePriceNum : undefined,
          coefficient:
            coefficientNum !== item.coefficient ? coefficientNum : undefined,
        };

        await menuItemsApi.update(item.id, updateData);
      } else {
        // Determine the category ID to use
        let categoryId;

        if (isNewCategory) {
          // Create a new category
          try {
            categoryId = await createCategoryIfNeeded(categoryName);
          } catch (err) {
            throw new Error(
              "Failed to create new category: " +
                (err instanceof Error ? err.message : String(err))
            );
          }
        } else {
          // Use the selected existing category
          categoryId = selectedCategoryId;
        }

        const createData: MenuItemCreate = {
          name,
          category_id: categoryId,
          base_price: basePriceNum,
        };

        await menuItemsApi.create(createData);
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving menu item:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null) {
        setError(JSON.stringify(err));
      } else {
        setError("Failed to save menu item: Unknown error");
      }
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
        <label className="block text-sm font-medium mb-1">Category</label>

        {/* Category selection toggle - Segmented Control */}
        <div className="inline-flex rounded-md shadow-sm mb-3 border border-input overflow-hidden">
          <Button
            type="button"
            variant={!isNewCategory ? "default" : "outline"}
            className={`rounded-none border-0 ${
              !isNewCategory ? "" : "hover:bg-muted"
            }`}
            onClick={() => {
              setIsNewCategory(false);
              setCategorySearch("");
            }}
          >
            Select existing
          </Button>
          <Button
            type="button"
            variant={isNewCategory ? "default" : "outline"}
            className={`rounded-none border-0 ${
              isNewCategory ? "" : "hover:bg-muted"
            }`}
            onClick={() => {
              setIsNewCategory(true);
              setCategorySearch("");
            }}
          >
            Create new
          </Button>
        </div>

        {/* Existing category dropdown */}
        {!isNewCategory && (
          <>
            {categories.length === 0 ? (
              <div className="mb-2">
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  No existing categories found. Please create a new one.
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="mt-1 h-auto p-0"
                  onClick={() => setIsNewCategory(true)}
                >
                  Create new category
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Search input for categories */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring pl-8"
                    disabled={loadingCategories}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                </div>

                {/* Custom Category Dropdown */}
                <div className="relative category-dropdown">
                  <div
                    className="w-full p-2 border border-input rounded-md bg-card flex justify-between items-center cursor-pointer"
                    onClick={() => {
                      if (!loadingCategories) {
                        setIsDropdownOpen(!isDropdownOpen);
                      }
                    }}
                  >
                    <span className="text-foreground">
                      {categories.find((cat) => cat.id === selectedCategoryId)
                        ?.name || "Select a category"}
                    </span>
                    <div className="flex items-center">
                      {loadingCategories ? (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      )}
                    </div>
                  </div>

                  {isDropdownOpen && !loadingCategories && (
                    <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-card border border-input overflow-hidden">
                      <div className="max-h-60 overflow-y-auto py-1">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${
                                selectedCategoryId === category.id
                                  ? "bg-primary/10 font-medium"
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedCategoryId(category.id);
                                setCategoryName(category.name);
                                setIsDropdownOpen(false);
                              }}
                            >
                              {category.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-muted-foreground text-sm">
                            No categories found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* New category input */}
        {isNewCategory && (
          <div className="relative">
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                // If user is typing in the field, ensure we're in "new category" mode
                if (!isNewCategory) {
                  setIsNewCategory(true);
                }
              }}
              className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              placeholder="Enter new category name"
            />
          </div>
        )}

        {isNewCategory && (
          <p className="text-xs text-muted-foreground mt-1">
            Enter a name for the new category. Category IDs will be generated
            automatically.
          </p>
        )}
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
          <label
            htmlFor="coefficient"
            className="block text-sm font-medium mb-1"
          >
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

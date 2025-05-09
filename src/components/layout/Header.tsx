import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Settings,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const { isAuthenticated, isAdmin, logout, debugCookies } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if the menu is open and the click is outside the menu and the profile button
      if (
        profileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }

    // Add the event listener only when the menu is open
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Handle logout
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    logout();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-opacity-80 shadow-sm transition-all duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Beverates Digital
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Debug button - only visible in development */}
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-yellow-500"
                onClick={() => {
                  debugCookies();
                  console.log("Debug button clicked");
                }}
              >
                <Bug className="h-5 w-5" />
              </Button>
            )}

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated && (
              <div className="relative" ref={profileMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" />
                </Button>

                {/* Profile Dropdown Menu - Inside the profileMenuRef container */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-md shadow-lg bg-card border border-border z-50 animate-fade-in origin-top-right">
                    <div
                      className="py-1 rounded-md bg-card"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      {isAdmin && (
                        <>
                          <Link
                            to="/profile"
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            Profile
                          </Link>

                          <Link
                            to="/admin/menu"
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                            Manage Menu
                          </Link>

                          <Link
                            to="/admin/orders"
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-muted transition-colors text-left"
                          >
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            Manage Orders
                          </Link>
                        </>
                      )}

                      <div className="border-t border-border my-1"></div>

                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        onClick={(e) => handleLogout(e)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Menu
              </Link>

              {isAuthenticated && (
                <Link
                  to="/profile"
                  className="text-foreground hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="text-foreground hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}

              {isAdmin && (
                <>
                  <div className="border-t border-border my-2 px-2"></div>
                  <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                    Admin
                  </p>

                  <Link
                    to="/admin/menu"
                    className="text-foreground hover:text-primary transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Menu
                  </Link>
                  <Link
                    to="/admin/orders"
                    className="text-foreground hover:text-primary transition-colors px-2 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Orders
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <div className="border-t border-border my-2 px-2"></div>
                  <button
                    className="text-destructive hover:text-destructive/80 transition-colors px-2 py-1 text-left"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Sign Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

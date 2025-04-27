import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { CartPage } from "@/pages/CartPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { AdminMenuPage } from "@/pages/admin/AdminMenuPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />

                {/* Admin Routes */}
                <Route path="/admin/menu" element={<AdminMenuPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
              </Routes>
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

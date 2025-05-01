import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { authApi } from "@/lib/api";
import { LoginRequest, User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginRequest) => Promise<boolean | void>;
  logout: () => void;
  debugCookies: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isServerAuthenticated = useRef<boolean>(false);

  const logout = useCallback(async () => {
    setUser(null);

    isServerAuthenticated.current = false;

    localStorage.removeItem("userEmail");
    localStorage.removeItem("authTimestamp");

    try {
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";

      document.cookie = "access_token=; max-age=0; path=/;";
      document.cookie = "refresh_token=; max-age=0; path=/;";

      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict;";

      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);

    try {
      await logout();

      const response = await authApi.login(data);

      if (response && response.user_id) {
        isServerAuthenticated.current = true;

        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("authTimestamp", Date.now().toString());

        setUser({
          id: response.user_id,
          email: data.email,
          is_admin: true,
        });
        return true;
      } else {
        throw new Error("Login failed: Invalid response from server");
      }
    } catch (error) {
      console.error("Login failed:", error);

      await logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedEmail = localStorage.getItem("userEmail");
        const authTimestamp = localStorage.getItem("authTimestamp");

        const isAuthValid =
          authTimestamp &&
          Date.now() - parseInt(authTimestamp) < 24 * 60 * 60 * 1000;

        if (savedEmail && isAuthValid) {
          try {
            setUser({
              id: "authenticated",
              email: savedEmail,
              is_admin: true,
            });

            isServerAuthenticated.current = true;
          } catch (authError) {
            console.error("Server authentication failed:", authError);
            localStorage.removeItem("userEmail");
            localStorage.removeItem("authTimestamp");
            setUser(null);
            isServerAuthenticated.current = false;
          }
        } else {
          setUser(null);
          isServerAuthenticated.current = false;

          if (savedEmail || authTimestamp) {
            localStorage.removeItem("userEmail");
            localStorage.removeItem("authTimestamp");
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
        isServerAuthenticated.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkSessionValidity = async () => {
      try {
        try {
          await authApi.refresh();

          isServerAuthenticated.current = true;
        } catch {
          console.log("Session verification failed, logging out user");
          await logout();
        }
      } catch (error) {
        console.error("Error checking session validity:", error);
      }
    };

    const intervalId = setInterval(checkSessionValidity, 60000);

    return () => clearInterval(intervalId);
  }, [user, logout]);

  const debugCookies = () => {
    const cookieStr = document.cookie;
    const savedEmail = localStorage.getItem("userEmail");
    const authTimestamp = localStorage.getItem("authTimestamp");

    console.log("=== Authentication Debug ===");
    console.log("Current cookies:", cookieStr);
    console.log("User state:", user ? "Logged in" : "Logged out");
    console.log("Server authenticated:", isServerAuthenticated.current);
    console.log("localStorage email:", savedEmail);
    console.log("localStorage timestamp:", authTimestamp);

    authApi
      .refresh()
      .then(() => console.log("Server verification: Success"))
      .catch((err) => console.log("Server verification: Failed", err.message));

    return "Authentication check complete";
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    login,
    logout,
    debugCookies,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

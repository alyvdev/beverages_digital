import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);

    localStorage.removeItem("userEmail");
    localStorage.removeItem("authTimestamp");

    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);

    try {
      document.cookie =
        "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      const response = await authApi.login(data);

      localStorage.setItem("userEmail", data.email);

      localStorage.setItem("authTimestamp", Date.now().toString());

      setUser({
        id: response.user_id || "authenticated",
        email: data.email,

        is_admin: true,
      });

      return true;
    } catch (error) {
      console.error("Login failed:", error);
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
          setUser({
            id: "authenticated",
            email: savedEmail,
            is_admin: true,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkTokenValidity = async () => {};

    checkTokenValidity();

    const intervalId = setInterval(checkTokenValidity, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    login,
    logout,
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

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Update the theme when it changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove("light", "dark");
    
    // Determine if we should use dark mode
    let darkModeOn = false;
    
    if (theme === "system") {
      // Check system preference
      darkModeOn = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      darkModeOn = theme === "dark";
    }
    
    // Apply the appropriate class
    root.classList.add(darkModeOn ? "dark" : "light");
    
    // Save the theme preference
    localStorage.setItem("theme", theme);
    
    // Update state
    setIsDarkMode(darkModeOn);
  }, [theme]);
  
  // Listen for system preference changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
      document.documentElement.classList.toggle("light", !mediaQuery.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
      >
        {theme === "light" && <Sun className="h-5 w-5" />}
        {theme === "dark" && <Moon className="h-5 w-5" />}
        {theme === "system" && <Monitor className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-card border border-border z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className={`w-full text-left px-4 py-2 text-sm ${
                theme === "light" ? "bg-accent text-accent-foreground" : "text-card-foreground hover:bg-muted"
              }`}
              onClick={() => toggleTheme("light")}
            >
              <div className="flex items-center">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </div>
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm ${
                theme === "dark" ? "bg-accent text-accent-foreground" : "text-card-foreground hover:bg-muted"
              }`}
              onClick={() => toggleTheme("dark")}
            >
              <div className="flex items-center">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </div>
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm ${
                theme === "system" ? "bg-accent text-accent-foreground" : "text-card-foreground hover:bg-muted"
              }`}
              onClick={() => toggleTheme("system")}
            >
              <div className="flex items-center">
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

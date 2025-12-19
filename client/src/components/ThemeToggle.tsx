import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/lib/mapStore";
import { useEffect } from "react";

export function ThemeToggle() {
  const { preferences, setPreferences } = useMapStore();
  const isDark = preferences.darkMode;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setPreferences({ darkMode: !isDark });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="bg-background/80 backdrop-blur-sm"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

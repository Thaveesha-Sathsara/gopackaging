import { Moon, Sun } from "lucide-react";
//import { Button } from "@/src/components/ui/button"; previously used Button component, but i changed according to the new UI design (Anjula:2025-09-09)
import { useTheme } from "./ThemeProvider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <button
      className="flex items-center gap-2 px-3 py-2 space-x-2 text-white text-[15px] bg-blue-700 rounded-lg hover:bg-blue-600"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
      )}
      Theme
    </button>
  );
}

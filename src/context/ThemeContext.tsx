import {
  getThemePreference,
  saveThemePreference,
} from "@/services/utils/secureStorage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that manages the application's theme state, allowing users to select between system, light, and dark modes.
 * @param param0 An object containing the children components that will have access to the theme context.
 * @returns A ThemeContext.Provider component.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const loadThemePreference = async () => {
      const savedThemeMode = await getThemePreference();
      if (
        savedThemeMode === "system" ||
        savedThemeMode === "light" ||
        savedThemeMode === "dark"
      ) {
        setThemeModeState(savedThemeMode);
      }
    };

    void loadThemePreference();
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    void saveThemePreference(mode).catch((error) => {
      console.error("Failed to save theme preference:", error);
    });
  }, []);

  const isDarkMode = useMemo(() => {
    if (themeMode === "system") return systemColorScheme === "dark";
    return themeMode === "dark";
  }, [themeMode, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

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
    void saveThemePreference(mode);
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

// hooks/useThemeColor.ts
import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";

export function useThemeColor() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? "dark" : "light";
    return Colors[theme];
}
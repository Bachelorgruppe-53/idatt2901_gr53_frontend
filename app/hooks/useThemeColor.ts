import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";

/**
 * This hook returns the current theme colors based on the theme context
 * @returns An object containing the current theme colors
 */

export function useThemeColor() {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? "dark" : "light";
    return Colors[theme];
}
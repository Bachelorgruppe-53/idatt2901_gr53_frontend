import { useMemo } from "react";
import { useThemeColor } from "./useThemeColor";
import { createThemedStyles } from "../constants/Styles";

/**
 * Hook to get theme-aware styles.
 * Memoized to prevent unnecessary re-renders.
 * 
 * @example
 * const styles = useThemedStyles();
 * <View style={styles.container} />
 */
export function useThemedStyles() {
  const theme = useThemeColor();
  
  return useMemo(() => createThemedStyles(theme), [theme]);
}
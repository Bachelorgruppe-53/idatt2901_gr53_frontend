import { useThemedStyles } from "../hooks/useStyleSheet";
import { View } from "react-native";

/**
 * Separator component that renders a horizontal line to visually separate content sections.
 * @returns A JSX element representing the separator, styled according to the current theme.
 */
export function Separator() {
  const themedStyles = useThemedStyles();

  return (
    <View style={themedStyles.separator}/>
  );
}


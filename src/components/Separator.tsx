import { useThemedStyles } from "../hooks/useStyleSheet";
import { View } from "react-native";

export function Separator() {
  const themedStyles = useThemedStyles();

  return (
    <View style={themedStyles.separator}/>
  );
}


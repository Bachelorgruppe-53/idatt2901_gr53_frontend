import { useThemeColor } from "@/src/hooks/useThemeColor";
import { StyleSheet, View } from "react-native";

export function Separator() {
  const borderColor = useThemeColor();

  return (
    <View style={[styles.separator, { backgroundColor: borderColor.border }]} />
  );
}

const styles = StyleSheet.create({
  separator: {
    alignSelf: "stretch",
    height: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

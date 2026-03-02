import { StyleSheet, View } from "react-native";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { Colors } from "@/src/constants/Colors";

/**
 * Placeholder for scoreboard entities to render while page loads
 *
 * @returns JSX.Element
 */
export default function EntityPlaceholder() {
  const themedStyles = useThemedStyles();

  return (
    <View style={[BaseStyles.rowCenter]}>
      <View style={styles.rankBadge} />

      <View style={BaseStyles.flex}>
        <View style={[BaseStyles.rowCenter, { justifyContent: "space-between" }]}>
          <View style={styles.placeholderEntity} />
          <View style={styles.placeholderScore} />
        </View>

        <View style={styles.barTrack}>
          <View style={styles.barFill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.brand.gray,
    flexShrink: 0,
  },
  placeholderEntity: {
    height: 14,
    width: "60%",
    borderRadius: 8,
    backgroundColor: Colors.brand.gray,
  },
  placeholderScore: {
    height: 12,
    width: 36,
    borderRadius: 8,
    backgroundColor: Colors.brand.gray,
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.brand.gray,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    width: "45%",
    borderRadius: 999,
    backgroundColor: Colors.brand.gray,
  },
});

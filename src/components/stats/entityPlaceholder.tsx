import { BaseStyles } from "@/src/constants/Styles";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { StyleSheet, View } from "react-native";

/**
 * Placeholder for scoreboard entities to render while page loads
 *
 * @returns JSX.Element
 */

export default function EntityPlaceholder() {
  const theme = useThemeColor();
  return (
    <View style={[BaseStyles.rowCenter, BaseStyles.gap16]}>
      <View
        style={[styles.rankBadge, { backgroundColor: theme.placeholder }]}
      />

      <View style={BaseStyles.flex}>
        <View
          style={[BaseStyles.rowCenter, { justifyContent: "space-between" }]}
        >
          <View
            style={[
              styles.placeholderEntity,
              { backgroundColor: theme.placeholder },
            ]}
          />
          <View
            style={[
              styles.placeholderScore,
              { backgroundColor: theme.placeholder },
            ]}
          />
        </View>

        <View style={styles.barTrack}>
          <View
            style={[styles.barFill, { backgroundColor: theme.placeholder }]}
          />
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
    flexShrink: 0,
  },
  placeholderEntity: {
    height: 14,
    width: "60%",
    borderRadius: 8,
  },
  placeholderScore: {
    height: 12,
    width: 36,
    borderRadius: 8,
  },
  barTrack: {
    marginTop: 6,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    width: "100%",
    borderRadius: 999,
  },
});

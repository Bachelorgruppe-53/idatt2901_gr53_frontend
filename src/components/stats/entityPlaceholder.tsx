import { StyleSheet, View } from "react-native";

/**
 * Placeholder for scoreboard entities to render while page loads
 *
 * @returns JSX.Element
 */
export default function EntityPlaceholder() {
  return (
    <View style={styles.row}>
      <View style={styles.rankBadge} />

      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },

  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#D6D6D6",
    flexShrink: 0,
  },

  rowContent: {
    flex: 1,
  },

  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  placeholderEntity: {
    height: 14,
    width: "60%",
    borderRadius: 8,
    backgroundColor: "#D6D6D6",
  },

  placeholderScore: {
    height: 12,
    width: 36,
    borderRadius: 8,
    backgroundColor: "#D6D6D6",
  },

  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#D6D6D6",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    width: "45%",
    borderRadius: 999,
    backgroundColor: "#C4C4C4",
  },
});

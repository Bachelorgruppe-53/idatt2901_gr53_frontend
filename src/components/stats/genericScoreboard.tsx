import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import EntityPlaceholder from "./entityPlaceholder";

type ScoreboardProps = {
  entities: string[];
  scores: number[];
  scoreboardType: string;
  isLoading?: boolean;
  points?: number;
  pointsLabel?: string;
  highlightedEntity?: string;
};

export default function Scoreboard(props: ScoreboardProps) {
  const { t } = useTranslation("stats");
  const userPoints = props.points ?? 250;
  const maxScore = Math.max(...props.scores, userPoints, 1);
  const placeholderCount = 12;

  const ranked = props.entities
    .map((entity, index) => ({
      entity,
      score: props.scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const getEntityBadgeStyle = (entity: string) => {
    let hash = 0;

    for (let index = 0; index < entity.length; index++) {
      hash = entity.charCodeAt(index) + ((hash << 5) - hash);
      hash |= 0;
    }

    const hue = Math.abs(hash) % 360;
    const saturation = 60;
    const lightness = 58;

    const c = (1 - Math.abs((2 * lightness) / 100 - 1)) * (saturation / 100);
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness / 100 - c / 2;

    let rPrime = 0;
    let gPrime = 0;
    let bPrime = 0;

    if (hue < 60) {
      rPrime = c;
      gPrime = x;
    } else if (hue < 120) {
      rPrime = x;
      gPrime = c;
    } else if (hue < 180) {
      gPrime = c;
      bPrime = x;
    } else if (hue < 240) {
      gPrime = x;
      bPrime = c;
    } else if (hue < 300) {
      rPrime = x;
      bPrime = c;
    } else {
      rPrime = c;
      bPrime = x;
    }

    const r = Math.round((rPrime + m) * 255);
    const g = Math.round((gPrime + m) * 255);
    const b = Math.round((bPrime + m) * 255);

    return {
      backgroundColor: `rgb(${r}, ${g}, ${b})`,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t(props.scoreboardType)}</Text>
            <Text style={styles.subtitle}>
              {t("scoreboardSubtitle", "Toppliste")}
            </Text>
          </View>

          <View style={styles.userChip}>
            <Text style={styles.userChipLabel}>
              {t(props.pointsLabel ?? "yourPoints")}
            </Text>
            <Text style={styles.userChipValue}>{userPoints}p</Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {props.isLoading
              ? Array.from({ length: placeholderCount }).map((_, index) => (
                  <EntityPlaceholder key={`placeholder-${index}`} />
                ))
              : ranked.map((entry, index) => {
                  const rank = index + 1;
                  const barWidth = `${Math.round(
                    (entry.score / maxScore) * 100,
                  )}%`;
                  const isHighlighted =
                    props.highlightedEntity &&
                    entry.entity === props.highlightedEntity;

                  return (
                    <View
                      key={`${entry.entity}-${rank}`}
                      style={[
                        styles.row,
                        isHighlighted && styles.rowHighlighted,
                      ]}
                    >
                      <View
                        style={[
                          styles.rankBadge,
                          getEntityBadgeStyle(entry.entity),
                        ]}
                      >
                        <Text style={styles.rankBadgeText}>{rank}</Text>
                      </View>

                      <View style={styles.rowContent}>
                        <View style={styles.rowHeader}>
                          <Text
                            style={styles.entity}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {entry.entity}
                          </Text>

                          <Text style={styles.score}>{entry.score}p</Text>
                        </View>

                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: barWidth }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  card: {
    backgroundColor: "#EFEEE6",
    borderRadius: 20,
    paddingVertical: 20,
    paddingBottom: 0,
    paddingHorizontal: 24,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 12 },
    // shadowOpacity: 0.2,
    // shadowRadius: 20,
    // elevation: 6,
    height: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#636a75",
  },

  userChip: {
    // backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-end",
    flexShrink: 0,
  },

  userChipLabel: {
    fontSize: 11,
    color: "#000000",
  },

  userChipValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3c3c3c",
  },

  list: {
    gap: 14,
    paddingBottom: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },

  rowHighlighted: {
    backgroundColor: "#00000033",
    // borderRadius: 12,
    // padding: 6,
  },

  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  rankBadgeText: {
    color: "#0F172A",
    fontWeight: "700",
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

  entity: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    flex: 1,
    marginRight: 8,
  },

  score: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flexShrink: 0,
  },

  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#D6D6D6",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#3c3c3c",
  },
});

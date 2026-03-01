import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import EntityPlaceholder from "./entityPlaceholder";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";

type ScoreboardProps = {
  entities: string[];
  scores: number[];
  scoreboardType: string;
  isLoading?: boolean;
  points?: number;
  pointsLabel?: string;
  highlightedEntity?: string;
};

/**
 * Generic scoreboard that ranks entities by score and renders a simple bar chart.
 *
 * @param props.entities Names to display (same order as scores).
 * @param props.scores Points per entity.
 * @param props.scoreboardType i18n key for the title.
 * @param props.isLoading Show placeholders while data loads.
 * @param props.points Points to show in the header chip (defaults to 250).
 * @param props.pointsLabel i18n key for the chip label.
 * @param props.highlightedEntity Entity name to visually emphasize.
 */
export default function Scoreboard(props: ScoreboardProps) {
  const { t } = useTranslation("stats");
  const userPoints = props.points ?? 250;
  const maxScore = Math.max(...props.scores, userPoints, 1);
  const placeholderCount = 12;
  const themedStyles = useThemedStyles();

  // Pair entities with scores and sort descending for ranking.
  const ranked = props.entities
    .map((entity, index) => ({
      entity,
      score: props.scores[index] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  // Deterministic color from entity name for rank badge.
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
    <View style={themedStyles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={BaseStyles.flex}>
            <Text style={themedStyles.heading}>{t(props.scoreboardType)}</Text>
            <Text style={themedStyles.placeholderText}>
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
          <View style={[BaseStyles.gap16, BaseStyles.px8]}>
            {props.isLoading
              ? Array.from({ length: placeholderCount }).map((_, index) => (
                  <EntityPlaceholder key={`placeholder-${index}`} />
                ))
              : ranked.map((entry, index) => {
                  const rank = index + 1;
                  // Width is relative to the max score to keep bars proportional.
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
                        BaseStyles.rowCenter,
                        isHighlighted && styles.rowHighlighted,
                      ]}
                    >
                      <View
                        style={[
                          styles.rankBadge,
                          getEntityBadgeStyle(entry.entity),
                        ]}
                      >
                        <Text style={themedStyles.boldText}>{rank}</Text>
                      </View>

                      <View style={BaseStyles.flex}>
                        <View style={BaseStyles.rowCenter}>
                          <Text
                            style={themedStyles.semiboldText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {entry.entity}
                          </Text>

                          <Text style={themedStyles.semiboldText}>{entry.score}p</Text>
                        </View>

                        <View style={styles.barTrack}>
                          <View style={styles.barFill} />
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
  card: {
    backgroundColor: "#EFEEE6",
    borderRadius: 20,
    paddingVertical: 20,
    paddingBottom: 0,
    paddingHorizontal: 24,
    height: "100%",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
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

  rowHighlighted: {
    // backgroundColor: "#00000033",
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

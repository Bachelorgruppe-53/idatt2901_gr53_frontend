import EntityPlaceholder from "@/src/components/stats/entityPlaceholder";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type ScoreboardProps = {
  entities: string[];
  scores: number[];
  scoreboardType: string;
  isLoading?: boolean;
  points?: number;
  pointsLabel?: string;
  highlightedEntity?: string;
  titleOverride?: string;
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
 * @param props.titleOverride Override the default title.
 */

export default function Scoreboard(props: ScoreboardProps) {
  const { t } = useTranslation("stats");
  const userPoints = props.points ?? 250;
  const placeholderCount = 12;
  const themedStyles = useThemedStyles();
  const theme = useThemeColor();

  const safeEntities = Array.isArray(props.entities) ? props.entities : [];
  const safeScores = Array.isArray(props.scores) ? props.scores : [];
  const maxScore = Math.max(...safeScores, userPoints, 1);

  const title = props.titleOverride ?? t(props.scoreboardType);

  // Pair entities with scores and sort descending for ranking.
  const ranked = safeEntities
    .map((entity, index) => {
      const safeEntity =
        typeof entity === "string" && entity.trim().length > 0
          ? entity
          : t("unknownPlayer", "Unknown");
      const rawScore = safeScores[index];
      const safeScore = typeof rawScore === "number" && Number.isFinite(rawScore) ? rawScore : 0;

      return {
        entity: safeEntity,
        score: safeScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Deterministic color from entity name for rank badge.
  const getEntityBadgeStyle = (entity: string) => {
    const safeEntity = (entity && entity.length > 0 ? entity : "unknown").toString();
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
    <View style={BaseStyles.p24}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={BaseStyles.flex}>
            <Text style={themedStyles.heading}>{title}</Text>
            <Text style={themedStyles.placeholderText}>
              {t("scoreboardSubtitle", "Toppliste")}
            </Text>
          </View>

          <View style={styles.userChip}>
            <Text style={[styles.userChipLabel, themedStyles.text]}>
              {t(props.pointsLabel ?? "yourPoints")}
            </Text>
            <Text style={themedStyles.pointValueText}>{userPoints}p</Text>
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
                  )}%` as `${number}%`;
                  const isHighlighted =
                    props.highlightedEntity &&
                    entry.entity === props.highlightedEntity;

                  return (
                    <View
                      key={`${entry.entity}-${rank}`}
                      style={[
                        BaseStyles.rowCenter,
                        BaseStyles.gap16,
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
                        <View
                          style={[
                            BaseStyles.rowCenter,
                            { justifyContent: "space-between" },
                          ]}
                        >
                          <Text
                            style={themedStyles.semiboldText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {entry.entity}
                          </Text>

                          <Text style={themedStyles.semiboldText}>
                            {entry.score}p
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.barTrack,
                            { backgroundColor: theme.barTrack },
                          ]}
                        >
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: barWidth,
                                backgroundColor: theme.barFill,
                              },
                            ]}
                          />
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
    borderRadius: 20,
    paddingVertical: 20,
    paddingBottom: 0,
    height: "100%",
    gap: 12,
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
    marginTop: 6,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 999,
  },
});

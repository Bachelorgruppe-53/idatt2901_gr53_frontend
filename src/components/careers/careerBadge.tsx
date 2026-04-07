import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLOR_BY_CODE } from "../../constants/ColorMap";
import { Colors } from "../../constants/Colors";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";

/**
 * CareerBadge component that displays a badge for a career/POI.
 * @props career_id - Unique identifier for the career.
 * @props careerName - Name of the career to display.
 * @props iconName - Material/MUI icon name for the career badge.
 * @props onPress - Callback function to handle press events, receives career_id and careerName as arguments.
 * @returns JSX.Element
 *
 */

type CareerBadgeProps = {
  career_id: number;
  careerName: string;
  iconName: string | null;
  colorCode: number | null;
  onPress: (career_id: number, careerName: string) => void;
};

const BADGE_SIZE = 64;

const MUI_ICON_SUFFIX_REGEX = /(Outlined|Rounded|Sharp|TwoTone)$/;

const toKebabCase = (rawName: string): string => {
  const cleaned = rawName.replace(MUI_ICON_SUFFIX_REGEX, "").trim();
  if (cleaned.length === 0) return "work";

  return cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
};

const candidateIconNames = (iconName: string): string[] => {
  const kebab = toKebabCase(iconName);
  const snake = kebab.replace(/-/g, "_");

  return [iconName, iconName.toLowerCase(), kebab, snake].filter(
    (value, index, arr) => value.length > 0 && arr.indexOf(value) === index,
  );
};

const resolveMaterialIconName = (
  iconName: string | null,
): keyof typeof MaterialIcons.glyphMap => {
  if (!iconName) {
    console.warn(
      "[CareerBadge] Missing iconName, falling back to default icon: question_mark",
    );
    return "question-mark";
  }

  if (iconName in MaterialIcons.glyphMap) {
    return iconName as keyof typeof MaterialIcons.glyphMap;
  }

  const candidates = candidateIconNames(iconName);
  for (const candidate of candidates) {
    if (candidate in MaterialIcons.glyphMap) {
      return candidate as keyof typeof MaterialIcons.glyphMap;
    }
  }

  console.warn(
    `[CareerBadge] Icon not found in MaterialIcons: ${iconName} (tried: ${candidates.join(", ")}). Falling back to: question_mark`,
  );
  return "question-mark";
};

const getBadgeColor = (colorCode: number | null): string => {
  if (!colorCode) {
    return Colors.brand.gray;
  }

  return COLOR_BY_CODE[colorCode] ?? Colors.brand.gray;
};

export default function CareerBadge({
  career_id,
  careerName,
  iconName,
  colorCode,
  onPress,
}: CareerBadgeProps) {
  const themedStyles = useThemedStyles();
  const materialIconName = resolveMaterialIconName(iconName);
  const badgeColor = getBadgeColor(colorCode);

  return (
    <Pressable
      style={[BaseStyles.alignCenter, { width: "28%" }]}
      onPress={() => onPress(career_id, careerName)}
    >
      <View style={styles.iconContainer}>
        <View style={styles.octagonClip}>
          <View
            style={[styles.octagonRotated, { backgroundColor: badgeColor }]}
          />
        </View>
        <MaterialIcons
          name={materialIconName}
          size={32}
          color={Colors.brand.white}
          style={styles.icon}
        />
      </View>
      <Text style={[themedStyles.boldText, BaseStyles.my8]}>{careerName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  octagonClip: {
    position: "absolute",
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  octagonRotated: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    transform: [{ rotate: "45deg" }],
  },
  icon: {
    zIndex: 4,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

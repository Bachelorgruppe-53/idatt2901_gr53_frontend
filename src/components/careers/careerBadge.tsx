import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLOR_BY_CODE } from "../../constants/ColorMap";
import { Colors } from "../../constants/Colors";
import { useThemedStyles } from "../../hooks/useStyleSheet";

/**
 * CareerBadge component that displays a badge for a career/POI.
 * @props career_id - Unique identifier for the career.
 * @props careerName - Name of the career to display.
 * @props iconName - Material/MUI icon name for the career badge.
 * @props onPress - Callback function to handle press events, receives career_id and optionally careerName as arguments.
 * @returns JSX.Element
 *
 */

type CareerBadgeProps = {
  career_id: number;
  careerName: string;
  iconName: string | null;
  colorCode: number | null;
  onPress: (career_id: number, careerName?: string) => void;
};

const BADGE_SIZE = 56;

const MUI_ICON_SUFFIX_REGEX = /(Outlined|Rounded|Sharp|TwoTone)$/;

/**
 * Converts a given raw icon name to kebab-case format, removing common MUI icon suffixes and trimming whitespace.
 * @param rawName The original icon name which may be in various formats (e.g., camelCase, PascalCase, kebab-case, snake_case) and may include MUI suffixes.
 * @returns The transformed icon name in kebab-case format, with MUI suffixes removed. If the resulting name is empty, it defaults to "work".
 */
const toKebabCase = (rawName: string): string => {
  const cleaned = rawName.replace(MUI_ICON_SUFFIX_REGEX, "").trim();
  if (cleaned.length === 0) return "work";

  return cleaned
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
};

/**
 * Generates candidate icon names based on the provided iconName by applying transformations such as converting to kebab-case and snake_case, and filtering out empty values and duplicates. 
 * This helps in resolving the correct Material Icon name even if the input iconName is not in the expected format.
 * @param iconName The original icon name to generate candidates from, which can be in various formats (e.g., camelCase, PascalCase, kebab-case, snake_case).
 * @returns An array of candidate icon names derived from the original iconName, which can be used to attempt to resolve a valid Material Icon name.
 */
const candidateIconNames = (iconName: string): string[] => {
  const kebab = toKebabCase(iconName);
  const snake = kebab.replace(/-/g, "_");

  return [iconName, iconName.toLowerCase(), kebab, snake].filter(
    (value, index, arr) => value.length > 0 && arr.indexOf(value) === index,
  );
};

/**
 * Resolves the appropriate Material Icon name based on the provided iconName by checking if it exists in the MaterialIcons glyph map.
 * @param iconName The original icon name to resolve, which can be in various formats (e.g., camelCase, PascalCase, kebab-case, snake_case).
 * @returns The resolved Material Icon name.
 */
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

/**
 * Determines the badge color based on the provided color code. If the color code is null or does not correspond to a defined color, it defaults to a gray color.
 * @param colorCode The color code associated with the career, which is used to look up the corresponding color in the COLOR_BY_CODE mapping. If null or invalid, a default gray color is returned.
 * @returns The determined badge color.
 */
const getBadgeColor = (colorCode: number | null): string => {
  if (!colorCode) {
    return Colors.brand.gray;
  }

  return COLOR_BY_CODE[colorCode] ?? Colors.brand.gray;
};

/**
 * CareerBadge component that displays a badge for a career/POI. 
 * It includes an icon and the career name, and is pressable to trigger a callback with the career ID and name.
 * @param param0 The props for the CareerBadge component, including career_id, careerName, iconName, colorCode, and onPress callback function.
 * @returns JSX.Element
 */
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
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        backgroundColor: pressed ? "rgba(0, 0, 0, 0.1)" : "transparent",
        borderRadius: 8,
      })}
      accessibilityRole="button"
      accessibilityLabel={`Career: ${careerName}`}
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
          size={28}
          color={Colors.brand.white}
          accessible={false}
          importantForAccessibility="no"
          style={styles.icon}
        />
      </View>
      <Text style={[themedStyles.boldText]} numberOfLines={2}>
        {careerName}
      </Text>
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

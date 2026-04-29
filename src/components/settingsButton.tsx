import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";
import { MaterialIcons } from "@expo/vector-icons";
// No MaterialIconsProps export; define iconName type below.
import { Href, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * Settings button component for accessing settings.
 * Matches the grid button styling in settings screen.
 *
 * @returns JSX.Element
 */

interface SettingsButtonProps {
  route?: string;
  onPress?: () => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
}

export default function SettingsButton({
  route,
  onPress,
  iconName,
  labelKey,
}: SettingsButtonProps) {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  
  const { t } = useTranslation("settings");
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      router.push(route as never);
    }
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handlePress}
      accessibilityLabel={t(labelKey)}
    >
      <MaterialIcons name={iconName} size={24} color={theme.text} />
      <Text style={[themedStyles.boldText, BaseStyles.mx16]}>
        {t(labelKey)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    padding: 10,
    paddingLeft: 20,
    borderRadius: 8,
  },
});

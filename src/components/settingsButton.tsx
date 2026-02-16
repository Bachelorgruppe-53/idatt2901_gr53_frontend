import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * Settings button component for accessing settings.
 * Matches the grid button styling in settings screen.
 *
 * @returns JSX.Element
 */

type SettingsButtonProps = {
  route: Href;
  iconName: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
};

export default function SettingsButton({
  route,
  iconName,
  labelKey,
}: SettingsButtonProps) {
  const theme = useThemeColor();
  const { t } = useTranslation("settings");

  const handleSettingsPress = () => {
    router.push(route);
  };

  return (
    <Pressable onPress={handleSettingsPress} style={styles.button}>
      <MaterialIcons name={iconName} size={24} color={theme.text} />
      <Text style={[styles.buttonText, { color: theme.text }]}>
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
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

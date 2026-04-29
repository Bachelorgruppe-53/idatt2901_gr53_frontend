import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * DEPRECATED USE settingsButton.tsx INSTEAD: Change language button component for accessing language settings.
 * Matches the grid button styling in settings screen.
 *
 * @returns JSX.Element
 */

export default function ChangeLanguageButton() {
  const theme = useThemeColor();
  const { t } = useTranslation("settings");

  const handleChangeLanguagePress = () => {
    router.push("/settings/lang/languageSelection");
  };

  return (
    <Pressable
      onPress={handleChangeLanguagePress}
      testID="change-language-button"
      style={styles.button}
    >
      <MaterialIcons name="language" size={24} color={theme.text} />
      <Text style={[styles.buttonText, { color: theme.text }]}>
        {t("language")}
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

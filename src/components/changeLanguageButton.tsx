import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * Change language button component for accessing language settings.
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
      style={[styles.gridItem, { backgroundColor: theme.button }]}
      testID="change-language-button"
    >
      <MaterialIcons name="language" size={24} color={theme.buttontext} />
      <Text style={[styles.buttonText, { color: theme.buttontext }]}>
        {t("language")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    height: 50,
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 4,
  },
});

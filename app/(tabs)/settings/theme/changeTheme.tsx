import { BaseStyles } from "@/src/constants/Styles";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * This component renders a screen for changing the app's theme.
 * @returns JSX.Element
 */

export default function ChangeThemeScreen() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useTheme();

  const options: {
    key: "system" | "light" | "dark";
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  }[] = [
    { key: "system", label: t("themeSystem"), icon: "brightness-6" },
    { key: "light", label: t("lightMode"), icon: "light-mode" },
    { key: "dark", label: t("darkMode"), icon: "dark-mode" },
  ];

  return (
    <View style={themedStyles.backgroundFlex}>
      <Stack.Screen
        options={{
          title: t("theme"),
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={BaseStyles.flex}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: Platform.OS === "android" ? insets.top + 70 : 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={themedStyles.heading}>{t("changeTheme")}</Text>

        <View style={BaseStyles.gap16}>
          {options.map((option) => {
            const isSelected = themeMode === option.key;
            return (
              <Pressable
                key={option.key}
                style={[
                  themedStyles.settingsButton,
                  {
                    borderColor: theme.text,
                    backgroundColor: isSelected
                      ? theme.backgroundSecondary
                      : "transparent",
                  },
                ]}
                onPress={() => setThemeMode(option.key)}
                testID={`theme-${option.key}`}
              >
                <View style={[BaseStyles.rowCenter, BaseStyles.gap16]}>
                  <MaterialIcons
                    name={option.icon}
                    size={22}
                    color={theme.text}
                  />
                  <Text
                    style={[
                      themedStyles.text,
                      {
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

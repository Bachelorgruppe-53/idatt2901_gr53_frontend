import { useTheme } from "@/src/context/ThemeContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChangeThemeScreen() {
  const theme = useThemeColor();
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
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("theme"),
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={[styles.header, { color: theme.text }]}>
          {t("changeTheme")}
        </Text>

        <View style={styles.list}>
          {options.map((option) => {
            const isSelected = themeMode === option.key;
            return (
              <Pressable
                key={option.key}
                style={[
                  styles.optionButton,
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
                <View style={styles.optionRow}>
                  <MaterialIcons
                    name={option.icon}
                    size={22}
                    color={theme.text}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: theme.text,
                        fontWeight: isSelected ? "700" : "600",
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  list: {
    gap: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    fontSize: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

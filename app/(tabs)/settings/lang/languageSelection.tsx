import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Custom flag component that supports both ISO codes and custom SVG
const FlagDisplay = ({
  isoCode,
  customFlag,
}: {
  isoCode?: string;
  customFlag?: any;
}) => {
  if (customFlag) {
    return (
      <Image
        source={customFlag}
        style={styles.customFlag}
        contentFit="contain"
      />
    );
  }
  if (isoCode) {
    return <CountryFlag isoCode={isoCode} size={24} />;
  }
  return null;
};

export default function LanguageSelectionScreen() {
  const theme = useThemeColor();
  const { i18n, t } = useTranslation("settings");
  const insets = useSafeAreaInsets();

  const languages = [
    { code: "no-NB", name: "Bokmål", isoCode: "NO" },
    { code: "no-NN", name: "Nynorsk", isoCode: "NO" },
    { code: "en-US", name: "English", isoCode: "GB" },
    {
      code: "sma",
      name: "Åarjelsaemien (WIP)",
      customFlag: require("@/assets/images/flags/Sami_flag.svg"), // Adjust path to your SVG location
    },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("language"),
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
        <Text style={styles.header}>{t("changeLanguage")}</Text>
        <View style={styles.languageList}>
          {languages.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <Pressable
                key={lang.code}
                style={[
                  styles.languageButton,
                  {
                    borderColor: theme.text,
                    backgroundColor: isSelected
                      ? theme.backgroundSecondary
                      : "transparent",
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                testID={`language-${lang.code}`}
              >
                <View style={styles.flagContainer}>
                  <FlagDisplay
                    isoCode={"isoCode" in lang ? lang.isoCode : undefined}
                    customFlag={
                      "customFlag" in lang ? lang.customFlag : undefined
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.languageName,
                    {
                      color: theme.text,
                      fontWeight: isSelected ? "700" : "600",
                    },
                  ]}
                >
                  {lang.name}
                </Text>
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
  languageList: {
    gap: 16,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    gap: 16,
  },
  flagContainer: {
    width: 40,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  customFlag: {
    width: 32,
    height: 24,
  },
  languageName: {
    fontSize: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

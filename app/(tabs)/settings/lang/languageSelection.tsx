import { saveLanguagePreference } from "@/services/utils/secureStorage";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
  const themedStyles = useThemedStyles();
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
    await saveLanguagePreference(languageCode);
  };

  return (
    <View style={[BaseStyles.flex, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("language"),
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
        <Text style={themedStyles.heading}>{t("changeLanguage")}</Text>
        <View style={BaseStyles.gap16}>
          {languages.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <Pressable
                key={lang.code}
                style={[
                  themedStyles.settingsButton,
                  {
                    borderColor: theme.button,
                    backgroundColor: isSelected
                      ? theme.backgroundSecondary
                      : "transparent",
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                testID={`language-${lang.code}`}
              >
                <View style={BaseStyles.gap16}>
                  <FlagDisplay
                    isoCode={"isoCode" in lang ? lang.isoCode : undefined}
                    customFlag={
                      "customFlag" in lang ? lang.customFlag : undefined
                    }
                  />
                </View>
                <Text
                  style={[
                    themedStyles.text,
                    {
                      fontWeight: isSelected ? "700" : "500",
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
  customFlag: {
    width: 32,
    height: 24,
  },
});

import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

/**
 * This component defines the layout for the settings section of the app. 
 * It uses a stack navigator to manage navigation between different settings screens, such as language selection, theme change, feedback form, privacy policy, and notification settings. 
 * Each screen is configured with appropriate header options for a consistent user experience.
 * @returns JSX.Element
 */

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="lang/languageSelection"
        options={{
          headerBackTitle: t("settings"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("language"),
        }}
      />
      <Stack.Screen
        name="theme/changeTheme"
        options={{
          headerBackTitle: t("settings"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("theme"),
        }}
      />
      <Stack.Screen
        name="feedback/feedbackForm"
        options={{
          headerBackTitle: t("settings"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("feedback"),
        }}
      />
      <Stack.Screen
        name="privacy/privacyPolicy"
        options={{
          headerBackTitle: t("settings"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("privacyPolicy"),
        }}
      />
      <Stack.Screen
        name="notifications/notificationSettings"
        options={{
          headerBackTitle: t("settings"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("notificationSettings"),
        }}
      />
    </Stack>
  );
}

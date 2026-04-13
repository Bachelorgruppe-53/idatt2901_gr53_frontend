import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

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

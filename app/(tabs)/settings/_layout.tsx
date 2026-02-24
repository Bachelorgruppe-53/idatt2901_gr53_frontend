import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="admin/login"
        options={{
          headerBackTitle: "Settings",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="admin/dashboard"
        options={{
          headerBackTitle: "Settings",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="admin/generateClassCode"
        options={{
          headerBackTitle: "Admin Dashboard",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("generateClassCode"),
        }}
      />
      <Stack.Screen
        name="lang/languageSelection"
        options={{
          headerBackTitle: "",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("language"),
        }}
      />
      <Stack.Screen
        name="theme/changeTheme"
        options={{
          headerBackTitle: "",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("theme"),
        }}
      />
      <Stack.Screen
        name="feedback/feedbackForm"
        options={{
          headerBackTitle: "",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: t("feedback"),
        }}
      />
    </Stack>
  );
}

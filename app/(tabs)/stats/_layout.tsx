import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function StatsLayout() {
  const { t } = useTranslation("stats");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="detail"
        options={{
          headerBackTitle: t("stats"),
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
          headerTitle: "",
        }}
      />
    </Stack>
  );
}

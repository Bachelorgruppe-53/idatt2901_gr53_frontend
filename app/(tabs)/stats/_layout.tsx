import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

/**
 * This component defines the layout for the stats section of the app.
 * @returns JSX.Element
 */

export default function StatsLayout() {
  const { t } = useTranslation("stats");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

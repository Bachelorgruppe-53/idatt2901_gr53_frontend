import { ThemeProvider } from "@/src/context/ThemeContext";
import "@/src/i18n/config";
import { Stack } from "expo-router";

/**
 * This component serves as the root layout for the app, wrapping the entire application in a ThemeProvider to manage theming across all screens.
 * It also sets up a Stack navigator for the main tab navigation of the app, with headers hidden for a cleaner look.
 * The main content of the app is rendered within the "(tabs)" screen, which is defined in a separate file and contains the individual tab screens for Home, Map, Stats, Settings, etc.
 * @returns JSX.Element
 */

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

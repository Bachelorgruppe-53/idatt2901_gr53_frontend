import { ThemeProvider } from "@/src/context/ThemeContext";
import "@/src/i18n/config";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

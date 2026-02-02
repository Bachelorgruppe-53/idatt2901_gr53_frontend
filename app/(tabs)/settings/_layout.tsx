import { Stack } from "expo-router";

export default function SettingsLayout() {
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
    </Stack>
  );
}

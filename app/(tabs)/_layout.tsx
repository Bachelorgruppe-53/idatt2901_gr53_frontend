import { useThemeColor } from "@/src/hooks/useThemeColor";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

export default function TabLayout() {
  const { t } = useTranslation("navbar");
  const theme = useThemeColor();

  const style = {
    selectedIcon: {
      tintColor: Platform.OS === "android" ? theme.buttontext : undefined,
    },
  };

  return (
    <NativeTabs
      {...(Platform.OS === "android"
        ? {
          backgroundColor: theme.background,
          badgeTextColor: theme.text,
          indicatorColor: theme.button,
          tintColor: theme.buttontext,
          
        }
        : {})}
    >
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Label selectedStyle={Platform.OS === "android" ? { color: theme.text } : undefined}>
          {t("map")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "map", selected: "map.fill" }}
          md="map"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label selectedStyle={Platform.OS === "android" ? { color: theme.text } : undefined}>
          {t("stats")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="poll"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label selectedStyle={Platform.OS === "android" ? { color: theme.text } : undefined}>
          {t("home")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="achievements">
        <NativeTabs.Trigger.Label selectedStyle={Platform.OS === "android" ? { color: theme.text } : undefined}>
          {t("achievements")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "trophy", selected: "trophy.fill" }}
          md="trophy"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label selectedStyle={Platform.OS === "android" ? { color: theme.text } : undefined}>
          {t("settings")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation("navbar");

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Label>{t("map")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "map", selected: "map.fill" }}
          md="map"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>{t("stats")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="poll"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t("home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="achievements">
        <NativeTabs.Trigger.Label>{t("achievements")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "trophy", selected: "trophy.fill" }}
          md="trophy"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>{t("settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

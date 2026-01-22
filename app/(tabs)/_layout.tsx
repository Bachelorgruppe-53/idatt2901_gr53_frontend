import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="achievements">
        <Label>Bragd</Label>
        <Icon
          sf={{ default: "trophy", selected: "trophy.fill" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <Label>Kart</Label>
        <Icon
          sf={{ default: "map", selected: "map.fill" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="index">
        <Label>Hjem</Label>
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          drawable="ic_home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="stats">
        <Label>Statistikk</Label>
        <Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Innstillinger</Label>
        <Icon
          sf={{ default: "gear", selected: "gear" }}
          drawable="ic_settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

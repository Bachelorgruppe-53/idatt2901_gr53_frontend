import { Separator } from "@/src/components/Separator";
import SettingsButton from "@/src/components/settingsButton";
import { Colors } from "@/src/constants/Colors";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * This page allows the user to change settings such as theme mode and language.
 *
 * @returns JSX.Element
 */

export default function SettingsScreen() {
  const theme = useThemeColor();

  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useAuth();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.header}>{t("settings")}</Text>
          <View style={styles.imageWrapper}>
            <Image
              source={require("@/assets/images/about.png")}
              style={styles.image}
            />
          </View>
          <Text style={[styles.description, { color: theme.text }]}>
            {t("aboutUsContent")}
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t("preferences")}
          </Text>
        </View>
        <Separator />
        {/* Language selection button */}
        <SettingsButton
          route="/settings/lang/languageSelection"
          iconName="language"
          labelKey="language"
        />
        <Separator />
        <SettingsButton
          route="/settings/theme/changeTheme"
          iconName="brightness-6"
          labelKey="theme"
        />
        <Separator />
        {/* Admin button, login if not authenticated, dashboard if authenticated */}
        {!isAuthenticated && (
          <SettingsButton
            route="/settings/admin/login"
            iconName="admin-panel-settings"
            labelKey="admin"
          />
        )}
        {isAuthenticated && (
          <SettingsButton
            route="/settings/admin/dashboard"
            iconName="admin-panel-settings"
            labelKey="dashboard"
          />
        )}
        <Separator />
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings")}
          </Text>
        </View>
        <Separator />
        {/* TODO: need to add a route here */}
        <SettingsButton
          route="/settings/notifications/notificationSettings"
          iconName="notifications"
          labelKey="notificationSettings"
        />
        <Separator />
        {/* TODO: need to add a route here */}
        <SettingsButton
          route="/settings/privacy/privacyPolicy"
          iconName="privacy-tip"
          labelKey="privacyPolicy"
        />
        <Separator />
        {/* TODO: need to add a route here */}
        <SettingsButton
          route="/settings/feedback/feedbackForm"
          iconName="feedback"
          labelKey="feedback"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageWrapper: {
    marginTop: 20,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    height: 200,
    width: 200,
    resizeMode: "contain",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text || Colors.dark.text,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: Colors.light.button || Colors.dark.button,
    paddingVertical: 15,
    borderRadius: 8,
    width: "80%",
  },
  section: {
    width: "100%",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 15,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
});

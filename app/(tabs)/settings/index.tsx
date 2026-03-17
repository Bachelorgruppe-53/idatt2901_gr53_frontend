import { Separator } from "@/src/components/Separator";
import SettingsButton from "@/src/components/settingsButton";
import { BaseStyles } from "@/src/constants/Styles";
import { useAuth } from "@/src/context/AuthContext";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLeaveClass } from "@/src/hooks/useLeaveClass";

/**
 * This page allows the user to change settings such as theme mode and language.
 *
 * @returns JSX.Element
 */

export default function SettingsScreen() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();

  const { isAuthenticated } = useAuth();
  const { leaveClass } = useLeaveClass();

  return (
    <ScrollView
      style={themedStyles.backgroundFlex}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        paddingTop: Platform.OS === "android" ? insets.top + 20 : 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={themedStyles.container}>
        <View style={themedStyles.settingsSection}>
          {/* <Text style={[styles.header, { color: theme.text }]}>
            {t("settings")}
          </Text> */}
          <View style={styles.imageWrapper}>
            <Text style={[themedStyles.heading, { marginTop: 20 }]}>
              {t("aboutUs")}
            </Text>
          </View>
          <Text
            style={[
              themedStyles.text,
              BaseStyles.textCenter,
              { marginBottom: 20 },
            ]}
          >
            {t("aboutUsContent")}
          </Text>
        </View>
        <Separator />
        {/* TODO: need to add a route here */}
        <SettingsButton
          route="/settings/feedback/feedbackForm"
          iconName="feedback"
          labelKey="feedback"
        />
        <Separator />
        <View style={themedStyles.settingsSection}>
          <Text
            style={[
              themedStyles.subheading,
              { marginVertical: 10, textAlign: "left" },
            ]}
          >
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
        <View style={themedStyles.settingsSection}>
          <Text style={[themedStyles.subheading, { marginVertical: 10 }]}>
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
        <View style={themedStyles.settingsSection}>
          <Text style={[themedStyles.subheading, { marginVertical: 10 }]}>
            {t("class", "Class")}
          </Text>
        </View>
        <Separator />
        <SettingsButton
          onPress={leaveClass}
          iconName="exit-to-app"
          labelKey="leaveClass"
        />
        <Separator />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});

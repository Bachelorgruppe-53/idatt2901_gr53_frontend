import { loadHomeSummary } from "@/services/home/loadHomeSummary";
import { Separator } from "@/src/components/Separator";
import SettingsButton from "@/src/components/settingsButton";
import { BaseStyles } from "@/src/constants/Styles";
import { useLeaveClass } from "@/src/hooks/useLeaveClass";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * This component renders the main settings screen for the app.
 * @returns JSX.Element
 */

export default function SettingsScreen() {
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("settings");
  const insets = useSafeAreaInsets();
  const [hasClass, setHasClass] = useState(false);

  const checkMembership = useCallback(async () => {
    try {
      const summary = await loadHomeSummary();
      setHasClass(Boolean(summary.summary?.classCode));
    } catch {
      setHasClass(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void checkMembership();
    }, [checkMembership]),
  );

  const { leaveClass } = useLeaveClass(() => {
    void checkMembership();
  });

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
        <View style={themedStyles.settingsSection}>
          <Text style={[themedStyles.subheading, { marginVertical: 10 }]}>
            {t("settings")}
          </Text>
        </View>
        <Separator />
        <SettingsButton
          route="/settings/notifications/notificationSettings"
          iconName="notifications"
          labelKey="notificationSettings"
        />
        <Separator />
        <SettingsButton
          route="/settings/privacy/privacyPolicy"
          iconName="privacy-tip"
          labelKey="privacyPolicy"
        />
        <Separator />

        {hasClass ? (
          <>
            <View style={themedStyles.settingsSection}>
              <Text style={[themedStyles.subheading, { marginVertical: 10 }]}>
                {t("class")}
              </Text>
            </View>
            <Separator />
            <SettingsButton
              onPress={leaveClass}
              iconName="exit-to-app"
              labelKey="leaveClass"
            />
            <Separator />
          </>
        ) : null}
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
});

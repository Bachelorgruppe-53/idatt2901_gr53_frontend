import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, Text, View } from "react-native";

export default function FeedbackForm() {
  const themedStyles = useThemedStyles();

  const { t } = useTranslation("settings");

  const openURL = async (url: string) => {
    // Check if the device supports the URL.
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the URL in the device's default browser.
      await Linking.openURL(url);
    } else {
      // Handle cases where the URL cannot be opened.
      alert(t("submitFeedbackError", { url }));
    }
  };

  return (
    <View style={themedStyles.container}>
      <Pressable
        style={themedStyles.button}
        onPress={() => openURL("https://forms.gle/fRM6GnwfrvnoytVe6")}
      >
        <Text style={themedStyles.buttonText}>{t("submitFeedback")}</Text>
      </Pressable>
    </View>
  );
}

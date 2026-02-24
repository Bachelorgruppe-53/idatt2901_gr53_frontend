import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function FeedbackForm() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  
  return (
    <View style={themedStyles.container}>
      <Pressable
        style={themedStyles.button}
        onPress={() => openURL("https://forms.gle/fRM6GnwfrvnoytVe6")}
      >
        <Text style={themedStyles.buttonText}>
          Submit Feedback
        </Text>
      </Pressable>
    </View>
  );
}

const openURL = async (url: string) => {
  // Check if the device supports the URL
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    // Open the URL in the device's default browser
    await Linking.openURL(url);
  } else {
    // Handle cases where the URL cannot be opened
    alert(`Don't know how to open this URL: ${url}`);
  }
};

import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export default function FeedbackForm() {
  const theme = useThemeColor();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => openURL("https://forms.gle/fRM6GnwfrvnoytVe6")}
      >
        <Text style={[styles.buttonText, { color: theme.buttontext }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});

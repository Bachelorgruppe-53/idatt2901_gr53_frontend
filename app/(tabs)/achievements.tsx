import { StyleSheet, Text, View } from "react-native";

export default function AchievementScreen() {
  return (
    <View style={styles.container}>
      <Text>Achievement Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

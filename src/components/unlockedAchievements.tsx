import { StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "../hooks/useStyleSheet";

// TODO: implement later
export default function Achievements() {
  const themedStyles = useThemedStyles();
  
  return (
    <View style={themedStyles.container}>
      <Text>Achievements Screen</Text>
    </View>
  );
}

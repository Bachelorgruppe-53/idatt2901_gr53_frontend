import { StyleSheet, Text, View } from "react-native";
import { MapComponent } from "../../src/components/mapComponent";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapComponent style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

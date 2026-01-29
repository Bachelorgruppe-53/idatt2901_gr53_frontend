import { Colors } from "@/src/constants/Colors";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColor } from "../../src/hooks/useThemeColor";

interface AdminProps {
    onClose: () => void;
}
// TODO: implement real admin login functionality
// TODO: legge inn admin-breadcrumbs?

export default function Admin({ onClose }: AdminProps) {
    const theme = useThemeColor();

  return (
    <View style={styles.container}>
      <Text>Admin Logg in side kommer her</Text>
      <Pressable style={[ styles.button, { backgroundColor: theme.button }]}
        onPress={() => {router.push("/admin/dashboard"); onClose();}}>
        <Text style={[ {color: theme.buttontext }]}>Logg inn</Text>
      </Pressable>
      <Pressable style={[ styles.button, { backgroundColor: Colors.brand.red }]}
        onPress={onClose}>
          <Text style={[ {color: theme.buttontext }]}>Lukk</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 15,
    borderRadius: 8,
    width: "80%",
  },

});

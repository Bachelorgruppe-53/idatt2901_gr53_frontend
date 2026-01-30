import AdminLogin from "@/src/components/adminLogin";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { StyleSheet, View } from "react-native";

export default function AdminLoginScreen() {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: useThemeColor().background },
      ]}
    >
      <AdminLogin />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

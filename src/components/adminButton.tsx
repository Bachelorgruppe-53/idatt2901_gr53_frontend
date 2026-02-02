import { useAuth } from "@/src/context/AuthContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

/**
 * Admin button component for accessing admin login/dashboard.
 * Routes to admin dashboard if authenticated, otherwise to login screen.
 * Matches the grid button styling in settings screen.
 *
 * @returns JSX.Element
 */
export default function AdminButton() {
  const theme = useThemeColor();
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const handleAdminPress = () => {
    if (isAuthenticated) {
      router.push("/settings/admin/dashboard");
    } else {
      router.push("/settings/admin/login");
    }
  };

  return (
    <Pressable
      onPress={handleAdminPress}
      style={[styles.gridItem, { backgroundColor: theme.button }]}
      testID="admin-button"
    >
      <MaterialIcons
        name="admin-panel-settings"
        size={24}
        color={theme.buttontext}
      />
      <Text style={[styles.buttonText, { color: theme.buttontext }]}>
        {isAuthenticated ? "Dashboard" : "Admin"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    height: 50,
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 4,
  },
});

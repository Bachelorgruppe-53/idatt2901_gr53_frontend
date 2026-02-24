import { logoutAdmin } from "@/services/authService";
import { Colors } from "@/src/constants/Colors";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { BaseStyles } from "@/src/constants/Styles";

/**
 * Admin dashboard screen component.
 *
 * @returns JSX.Element
 */

export default function AdminDashboard() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const { setAuthenticated } = useAuth();

  return (
    <View style={themedStyles.container}>
      <Pressable
        style={themedStyles.logoutButton}
        onPress={async () => {
          await logoutAdmin();
          setAuthenticated(false);
          router.back();
        }}
      >
        <Text style={{ color: Colors.brand.white }}>Logg ut</Text>
      </Pressable>
      <View style={BaseStyles.rowCenter}>
        <MaterialCommunityIcons
          name="shield-account"
          size={50}
          color={theme.text}
        />
        <Text style={themedStyles.heading}>
          Admin Dashboard
        </Text>
      </View>
      <Pressable
        style={themedStyles.button}
        onPress={() => router.push("/(tabs)/settings/admin/generateClassCode")}
      >
        <Text style={themedStyles.buttonText}>Generer Klassekode</Text>
      </Pressable>
      <Pressable
        style={themedStyles.button}
        onPress={() => alert("Legg til nye yrker")}
      >
        <Text style={themedStyles.buttonText}>Legg til nye yrker</Text>
      </Pressable>
    </View>
  );
}



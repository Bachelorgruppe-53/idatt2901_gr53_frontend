import { Pressable, StyleSheet, Text, View,  } from "react-native";
import { router } from "expo-router";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { Colors } from "@/src/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
 
/**
 * Admin dashboard screen component.
 * 
 * @returns JSX.Element
 */

export default function AdminDashboard() {
  const theme = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Pressable style={[styles.logoutButton, { backgroundColor: Colors.brand.red }]} 
        onPress={() => router.back("/settings")}>
        <Text style={{ color: Colors.brand.white }}>Logg ut</Text>
      </Pressable>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-account" size={50} color={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Dashboard</Text>
      </View>
      <Pressable style={[ styles.button, { backgroundColor: theme.button }]}
        onPress={() => router.push("/admin/generateClassCode")}>
        <Text style={{ color: theme.buttontext }}>Generer Klassekode</Text>
      </Pressable>
      <Pressable style={[ styles.button, { backgroundColor: theme.button }]}
        onPress={() => alert("Legg til nye yrker")}>
        <Text style={{ color: theme.buttontext }}>Legg til nye yrker</Text>
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
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 5,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
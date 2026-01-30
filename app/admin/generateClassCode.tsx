import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors } from "@/src/constants/Colors";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/src/hooks/useThemeColor";

/**
 * Generate Class Code screen component.
 * 
 * @returns JSX.Element
 */

export default function GenerateClassCode() {
    const theme = useThemeColor();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Pressable style={styles.backButton}
            onPress={() => router.back("/admin/dashboard")}>
            <MaterialCommunityIcons name="arrow-left" size={30} color={theme.text} />
        </Pressable>
        <View style={styles.header}>
            <MaterialCommunityIcons name="shield-account" size={50} color={theme.text} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Generer Klassekode</Text>
        </View>
        <View style={styles.inputContainer}>
            <Text style={{ color: theme.text }}>Klassenavn:</Text>
            <TextInput style={[styles.input, { color: theme.text }]} placeholder="Skriv inn klassenavn her" ></TextInput>
        </View>
        <View style={styles.inputContainer}>
            <Text style={{ color: theme.text }}>Skole:</Text>
            <TextInput style={[styles.input, { color: theme.text },]} placeholder="Skriv inn skole her" ></TextInput>
        </View>
        <Pressable style={[ styles.button, { backgroundColor: Colors.brand.green }]}
            onPress={() => alert("Generer klassekode funksjonalitet kommer her")}>
            <Text style={{ color: theme.text }}>Generer Klassekode</Text>
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
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
  input: {
    height: 40,
    borderColor: Colors.brand.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  inputContainer: {
    width: "80%",
    marginBottom: 20,
  },
});
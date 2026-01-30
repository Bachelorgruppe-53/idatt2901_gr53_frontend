import { Colors } from "@/src/constants/Colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * this page allows the user to change settings such as theme mode and language.
 *
 * @returns JSX.Element
 */

//TODO: implement functionality

export default function SettingsScreen() {
  const theme = useThemeColor();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Settings options in a grid layout */}
      <View style={styles.grid}>
        <Pressable
          style={[styles.gridItem, { backgroundColor: theme.button }]}
          onPress={toggleTheme}
        >
          <MaterialIcons
            name={isDarkMode ? "dark-mode" : "light-mode"}
            size={24}
            color={theme.buttontext}
          />
          <Text style={[styles.buttonText, { color: theme.buttontext }]}>
            {" "}
            {isDarkMode ? "Lys modus" : "Mørk modus"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.gridItem, { backgroundColor: theme.button }]}
          onPress={() => alert("språk")}
        >
          <MaterialIcons name="language" size={24} color={theme.buttontext} />
          <Text style={[styles.buttonText, { color: theme.buttontext }]}>
            {" "}
            Endre språk
          </Text>
        </Pressable>
        <Pressable
          style={[styles.gridItem, { backgroundColor: theme.button }]}
          onPress={() => router.push("/settings/admin/login")}
        >
          <MaterialIcons
            name="admin-panel-settings"
            size={24}
            color={theme.buttontext}
          />
          <Text style={[styles.buttonText, { color: theme.buttontext }]}>
            {" "}
            Admin login
          </Text>
        </Pressable>
        <Pressable
          style={[styles.gridItem, { backgroundColor: theme.button }]}
          onPress={() => alert("edit profil")}
        >
          <MaterialIcons name="person" size={24} color={theme.buttontext} />
          <Text style={[styles.buttonText, { color: theme.buttontext }]}>
            {" "}
            Rediger profil
          </Text>
        </Pressable>
      </View>

      <View style={styles.imageWrapper}>
        <Image
          source={require("@/assets/images/about.png")}
          style={styles.image}
        />
      </View>

      <Text style={[styles.header, { color: theme.text }]}>Om oss</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        Dette er en prototype av en app utviklet av studenter fra NTNU for St.
        Olavs hospital i Trondheim. Appen har som mål å hjelpe elever med å
        oppdage og utforske ulike yrker innen helsesektoren gjennom interaktive
        funksjoner som karrieretester og QR-kodeskanning.
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => alert("tilbakemelding")}
      >
        <MaterialIcons name="feedback" size={24} color={theme.buttontext} />
        <Text style={[styles.buttonText, { color: theme.buttontext }]}>
          {" "}
          Gi oss tilbakemelding
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: 15,
    justifyContent: "center",
  },
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
  },
  imageWrapper: {
    marginTop: 60,
    borderRadius: 100,
  },
  image: {
    height: 200,
    width: 200,
    resizeMode: "contain",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 30,
    color: Colors.light.text || Colors.dark.text,
  },
  paragraph: {
    fontSize: 16,
    marginTop: 15,
    paddingHorizontal: 20,
    textAlign: "center",
    color: Colors.light.text || Colors.dark.text,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: Colors.light.button || Colors.dark.button,
    paddingVertical: 15,
    borderRadius: 8,
    width: "80%",
  },
});

import { Pressable, StyleSheet, Text, View, useColorScheme, Image } from "react-native";
import { Colors } from "../../constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();

  return (
    <View 
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <View style={styles.grid}>
        <Pressable
          style={styles.gridItem}
          onPress={() => colorScheme === "dark" ? alert("Bytt til lys modus") : alert("Bytt til mørk modus")}
          >
          <MaterialIcons name="dark-mode" size={24} color={Colors[colorScheme ?? "light"].buttontext} />
          <Text style={styles.buttonText}> {colorScheme === "dark" ? "Lys modus" : "Mørk modus"}</Text>
          </Pressable>
        <Pressable
          style={styles.gridItem}
          onPress={() => alert("språk")}
        >
          <MaterialIcons name="language" size={24} color={Colors[colorScheme ?? "light"].buttontext} />
          <Text style={styles.buttonText}> Endre språk</Text>
        </Pressable>
        <Pressable
          style={styles.gridItem}
          onPress={() => alert("admin login")}
        >
          <MaterialIcons name="admin-panel-settings" size={24} color={Colors[colorScheme ?? "light"].buttontext} />
          <Text style={styles.buttonText}> Admin login</Text>
        </Pressable>
        <Pressable
          style={styles.gridItem}
          onPress={() => alert("edit profil")}
        >
          <MaterialIcons name="person" size={24} color={Colors[colorScheme ?? "light"].buttontext} />
          <Text style={styles.buttonText}> Rediger profil</Text>
        </Pressable>
      </View>

      <View style={styles.imageWrapper}>
          <Image
            source={require("../../assets/images/about.png")}
            style={styles.image}
          />
      </View>

      <Text style={styles.header}>Om oss</Text>
      <Text style={styles.paragraph}>
        Dette er en prototype av en app utviklet for studenter ved 
        St. Olavs hospital i Trondheim. Appen har som mål å hjelpe elever
        med å oppdage og utforske ulike yrker innen helsesektoren gjennom interaktive
        funksjoner som karrieretester og QR-kodeskanning.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => alert("tilbakemelding")}
      >
        <MaterialIcons name="feedback" size={24} color={Colors[colorScheme ?? "light"].buttontext} />
        <Text style={styles.buttonText}> Gi oss tilbakemelding</Text>
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
    backgroundColor: Colors.light.button || Colors.dark.button,
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    color: Colors.light.buttontext || Colors.dark.buttontext,
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

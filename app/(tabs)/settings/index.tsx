import AdminButton from "@/src/components/adminButton";
import ChangeLanguageButton from "@/src/components/changeLanguageButton";
import { Colors } from "@/src/constants/Colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * this page allows the user to change settings such as theme mode and language.
 *
 * @returns JSX.Element
 */

//TODO: implement functionality

export default function SettingsScreen() {
  const theme = useThemeColor();

  const { t } = useTranslation("settings");

  const { isDarkMode, toggleTheme } = useTheme();

  const openURL = async (url: string) => {
    // Check if the device supports the URL
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the URL in the device's default browser
      await Linking.openURL(url);
    } else {
      // Handle cases where the URL cannot be opened
      alert(`Don't know how to open this URL: ${url}`);
    }
  };

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
            {isDarkMode ? t("lightMode") : t("darkMode")}
          </Text>
        </Pressable>
        <ChangeLanguageButton />
        <AdminButton />
        <Pressable
          style={[styles.gridItem, { backgroundColor: theme.button }]}
          onPress={() => alert("edit profil")}
        >
          <MaterialIcons name="person" size={24} color={theme.buttontext} />
          <Text style={[styles.buttonText, { color: theme.buttontext }]}>
            {" "}
            {t("editProfile")}
          </Text>
        </Pressable>
      </View>

      <View style={styles.imageWrapper}>
        <Image
          source={require("@/assets/images/about.png")}
          style={styles.image}
        />
      </View>

      <Text style={[styles.header, { color: theme.text }]}>{t("aboutUs")}</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        {t("aboutUsContent")}
      </Text>

      <Pressable
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => openURL("https://forms.gle/fRM6GnwfrvnoytVe6")}
      >
        <MaterialIcons name="feedback" size={24} color={theme.buttontext} />
        <Text style={[styles.buttonText, { color: theme.buttontext }]}>
          {" "}
          {t("feedback")}
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

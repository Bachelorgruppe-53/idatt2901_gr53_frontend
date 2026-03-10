import { registerDevice } from "@/services/authService";
import { getNickname } from "@/services/utils/secureStorage";
import AboutCareer from "@/src/components/careers/aboutCareer";
import { JoinClassModal } from "@/src/components/joinClass";
import { BaseStyles } from "@/src/constants/Styles";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { QRScanner } from "../../src/components/QRScanner";
import { Colors } from "../../src/constants/Colors";
import { useThemeColor } from "../../src/hooks/useThemeColor";

/**
 * This page is the main landing page when the user opens the app.
 * It displays a welcome message, user profile image, and buttons for
 * taking a career test, viewing class overview, and scanning QR codes.
 *
 * @returns JSX.Element
 */


export default function Index() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const isReady = true; // Midlertidig hardkodet til true for testing, disable knapper hvis false
  const { isScanning, startScanning, stopScanning } = useQRScanner();
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [remountKey, setRemountKey] = useState(0);

  const { t } = useTranslation("home");

  const loadNickname = async () => {
    console.log("Loading nickname from secure storage...");
    const cached = await getNickname();
    console.log("Nickname loaded:", cached);
    if (cached) {
      setName(cached);
    }
  };

  // Load nickname from storage on mount
  useEffect(() => {
    console.log("Index component mounted, loading nickname...");
    void loadNickname();
  }, []);

  const handleRegisterDevice = async () => {
    try {
      await registerDevice();
      await loadNickname();
      setRemountKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to register device:", error);
      alert(t("registerFailed", "Failed to register device"));
    }
  };

  const handleScan = (data: string) => {
    stopScanning();
    const scannedId = parseInt(data.trim(), 10);
    
    if (isNaN(scannedId) || scannedId <= 0) {
      alert(t("invalidQR", "Invalid QR code"));
      return;
    }

    setSelectedCareerId(scannedId);
    setShowCareerModal(true);
  };

  const handleQRPress = async () => {
    const started = await startScanning();
    if (!started) {
      alert(t("cameraDenied"));
    }
  };

  if (isScanning) {
    return <QRScanner onScan={handleScan} onClose={stopScanning} />;
  }

  if (showJoinClass) {
    return <JoinClassModal onClose={() => setShowJoinClass(false)} />;
  }

  if (showCareerModal && selectedCareerId) {
    return (
      <AboutCareer
        careerId={selectedCareerId}
        onClose={() => setShowCareerModal(false)}
      />
    );
  }

  return (
    <View key={remountKey} style={themedStyles.container}>
      <Text
        style={[themedStyles.heading, { position: "absolute", top: "10%" }]}
      >
        St. Olavs hospital
      </Text>
      <View
        style={[BaseStyles.rowCenter, { position: "absolute", top: "15%" }]}
      >
        <MaterialIcons name="star" size={24} color={Colors.brand.darkYellow} />
        <Text style={themedStyles.subheading}>{t("favoriteCareer")}</Text>
      </View>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/images/profile/1.png")}
          style={styles.image}
        />
      </View>
      <Text style={[themedStyles.subheading, { marginBottom: 10 }]}>
        {t("hello")},
      </Text>
      <Text style={[themedStyles.subheading]}>
        {name ? name : t("welcomeMessage")}!
      </Text>

      <Pressable
        style={[themedStyles.button, !isReady && styles.buttonDisabled]}
        onPress={handleRegisterDevice}
        disabled={!isReady}
      >
        <Text style={themedStyles.buttonText}>
          {/* {t("takeTest")} */} register device (TEMP)
        </Text>
      </Pressable>

      <Pressable
        style={[themedStyles.button, !isReady && styles.buttonDisabled]}
        onPress={() => setShowJoinClass(true)}
        disabled={!isReady}
      >
        <Text style={themedStyles.buttonText}>{t("joinClass")}</Text>
      </Pressable>
      <Pressable
        style={[themedStyles.buttonRound, !isReady && styles.buttonDisabled]}
        onPress={handleQRPress}
        disabled={!isReady}
      >
        <MaterialIcons
          name="qr-code-scanner"
          size={35}
          color={theme.buttontext}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 100,
  },
  image: {
    width: 200,
    height: 200,
  },
  name: {
    fontSize: 25,
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonRound: {
    marginTop: 30,
    backgroundColor: Colors.brand.purple || Colors.brand.green,
    padding: 15,
    borderRadius: 50,
  },
  buttonDisabled: {
    backgroundColor: Colors.brand.gray,
  },
});

import JoinClassModal from "@/src/components/joinClass";
import AboutCareer from "@/src/components/aboutCareer";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { QRScanner } from "../../src/components/QRScanner";
import { Colors } from "../../src/constants/Colors";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { router } from "expo-router";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { BaseStyles } from "@/src/constants/Styles";

/**
 * This page is the main landing page when the user opens the app.
 * It displays a welcome message, user profile image, and buttons for
 * taking a career test, viewing class overview, and scanning QR codes.
 *
 * @returns JSX.Element
 */

// TODO: add all functionality to buttons and QR scanner

export default function Index() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const isReady = true; // Midlertidig hardkodet til true for testing, disable knapper hvis false
  const { isScanning, startScanning, stopScanning, permissionError } =
    useQRScanner();
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const { t } = useTranslation("home");

  const handleScan = (data: string) => {
    stopScanning();
    const careerName = data.trim();
    if (!careerName) {
      alert(t("invalidQR"));
      return;
    }

    setSelectedCareer(careerName);
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

  if (showCareerModal && selectedCareer) {
    return (
      <AboutCareer
        careerName={selectedCareer}
        onClose={() => setShowCareerModal(false)}
      />
    );
  }

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.heading}>
        St. Olavs hospital
      </Text>
      <View style={BaseStyles.rowCenter}>
        <MaterialIcons name="star" size={24} color={Colors.brand.darkYellow} />
        <Text style={themedStyles.boldText}>
          {t("favoriteCareer")}
        </Text>
      </View>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/images/profile/1.png")}
          style={styles.image}
        />
      </View>
      <Text style={themedStyles.subheading}> Hei, du!</Text>

      <Pressable
        style={[
          themedStyles.button,
          !isReady && styles.buttonDisabled,
        ]}
        onPress={() =>
          isReady ? alert("midlertidig alert - karrieretesten!") : null
        }
        disabled={!isReady}
      >
        <Text style={themedStyles.buttonText}>
          {t("takeTest")}
        </Text>
      </Pressable>

      <Pressable
        style={[
          themedStyles.button,
          !isReady && styles.buttonDisabled,
        ]}
        onPress={() => setShowJoinClass(true)}
        disabled={!isReady}
      >
        <Text style={themedStyles.buttonText}>
          {t("joinClass")}
        </Text>
      </Pressable>

      <Pressable
        style={[
          themedStyles.buttonRound,
          !isReady && styles.buttonDisabled,
        ]}
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
    marginTop: 20,
    borderRadius: 100,
  },
  image: {
    width: 200,
    height: 200,
  },
  buttonDisabled: {
    backgroundColor: Colors.brand.gray,
  },
});

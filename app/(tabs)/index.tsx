import { registerDevice, ensureUserId } from "@/services/authService";
import { getApiBaseUrl } from "@/services/apiConfig";
import { getNickname } from "@/services/utils/secureStorage";
import AboutCareer from "@/src/components/careers/aboutCareer";
import { JoinClassModal } from "@/src/components/joinClass";
import { BaseStyles } from "@/src/constants/Styles";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppState, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { QRScanner } from "../../src/components/QRScanner";
import { Colors } from "../../src/constants/Colors";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { useFocusEffect } from "expo-router";


/**
 * This page is the main landing page when the user opens the app.
 * It displays a welcome message, user profile image, and buttons for
 * taking a career test, viewing class overview, and scanning QR codes.
 *
 * @returns JSX.Element
 */

type UserSummary = {
  nickname: string;
  points: number;
  className: string;
  schoolName: string;
  classCode: string;
};

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
  const [points, setPoints] = useState<number>(0);

  const { t } = useTranslation("home");

  const loadNickname = async () => {
    console.log("Loading nickname from secure storage...");
    const cached = await getNickname();
    console.log("Nickname loaded:", cached);
    if (cached) {
      setName(cached);
    }
  };

  const pointsRequestIdRef = useRef(0);

  // Function to load points from backend and handle various edge cases and errors robustly
  const loadPoints = useCallback(async () => {
    const requestId = ++pointsRequestIdRef.current;

    const applyPoints = (nextPoints: number) => {
      if (requestId !== pointsRequestIdRef.current) return;
      setPoints(nextPoints);
    };

    const parseBackendError = (raw: string): string => {
      try {
        const parsed = JSON.parse(raw) as { error?: string; message?: string };
        return (parsed.error ?? parsed.message ?? raw).toLowerCase();
      } catch {
        return raw.toLowerCase();
      }
    };
    try {
      let userId = await ensureUserId();
      const baseUrl = getApiBaseUrl().replace(/\/$/, "");
      const url = `${baseUrl}/user/summary`;

      const requestSummary = async (id: string) => {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-User-ID": id,
          },
        });
        const raw = await res.text();
        console.log("[points] status:", res.status, "ok:", res.ok);
        console.log("[points] raw response:", raw);
        return { res, raw };
      };

      let { res, raw } = await requestSummary(userId);

      if (!res.ok && res.status === 400 && raw.includes("Invalid UUID format")) {
        userId = await registerDevice();
        ({ res, raw } = await requestSummary(userId));
      }

      if (!res.ok) {
        const backendMsg = parseBackendError(raw);

        if (backendMsg.includes("not related to a class")) {
          applyPoints(0);
          return;
        }

        console.warn("Failed /user/summary:", res.status, raw);
        return;
      }

      if (raw.startsWith("This user")) {
        applyPoints(0);
        return;
      }

      let json: UserSummary;
      try {
        json = JSON.parse(raw) as UserSummary;
      } catch {
        console.warn("Invalid JSON from /user/summary:", raw);
        return;
      }

      applyPoints(Number(json.points) || 0);

      if (json.nickname) {
        setName(json.nickname);
      }
    } catch (error) {
      console.error("Failed to load points:", error);
    }
  }, []);

  // Load nickname from storage on mount
  useEffect(() => {
    console.log("Index component mounted, loading nickname...");
    void loadNickname();
    void loadPoints();
  }, [loadPoints]);

  // Auto-refresh whenever this tab/screen becomes focused
  useFocusEffect(
    useCallback(() => {
      void loadPoints();

      const interval = setInterval(() => {
        void loadPoints();
      }, 15000);

      return () => clearInterval(interval);
    }, [loadPoints]),
  );

  // Auto-refresh when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void loadPoints();
      }
    });

    return () => sub.remove();
  }, [loadPoints]);

  const handleRegisterDevice = async () => {
    try {
      await registerDevice();
      await loadNickname();
      await loadPoints();
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
    return (
      <JoinClassModal
        onClose={() => setShowJoinClass(false)}
        onJoined={() => {
          void loadPoints();
        }}
      />
    );
  }

  if (showCareerModal && selectedCareerId) {
    return (
      <AboutCareer
        careerId={selectedCareerId}
        onClose={() => {
          setShowCareerModal(false);
          void loadPoints(); // refresh after possible claim
        }}
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
      <View style={[BaseStyles.rowCenter, { marginTop: 8, marginBottom: 14 }]}>
        <MaterialIcons name="stars" size={18} color={Colors.brand.darkYellow} />
        <Text style={[themedStyles.text, { marginLeft: 6 }]}>
          {points} {t("points", "poeng")}
        </Text>
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
  buttonDisabled: {
    backgroundColor: Colors.brand.gray,
  },
});

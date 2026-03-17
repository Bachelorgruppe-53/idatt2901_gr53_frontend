import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId, registerDevice } from "@/services/authService";
import { getNickname } from "@/services/utils/secureStorage";
import type { UserSummary } from "@/services/types/summary";
import AboutCareer from "@/src/components/careers/aboutCareer";
import { JoinClassModal } from "@/src/components/joinClass";
import { BaseStyles } from "@/src/constants/Styles";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  AppState,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { QRScanner } from "../../src/components/QRScanner";
import { Colors } from "../../src/constants/Colors";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import {
  GET_SCHOOL_CLASSES_PATH,
  type GetSchoolClassesResponse,
  type SchoolClassSummary,
} from "@/services/types/schoolClass";

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
  const [points, setPoints] = useState<number>(0);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [classPoints, setClassPoints] = useState<number | null>(null);
  const [showContestInfo, setShowContestInfo] = useState(false);

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

    const applySummary = (nextSummary: UserSummary | null) => {
      if (requestId !== pointsRequestIdRef.current) return;
      setSummary(nextSummary);
    };

    const applyClassPoints = (nextClassPoints: number | null) => {
      if (requestId !== pointsRequestIdRef.current) return;
      setClassPoints(nextClassPoints);
    };

    const normalizeSchoolClasses = (
      payload: GetSchoolClassesResponse,
    ): SchoolClassSummary[] => {
      if (Array.isArray(payload)) return payload;
      return payload.content ?? [];
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
          applySummary(null);
          applyClassPoints(null);
          return;
        }

        console.warn("Failed /user/summary:", res.status, raw);
        return;
      }

      if (raw.startsWith("This user")) {
        applyPoints(0);
        applySummary(null);
        applyClassPoints(null);
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
      applySummary(json);

      if (json.nickname) {
        setName(json.nickname);
      }

      if (!json.classCode) {
        applyClassPoints(null);
        return;
      }

      // Fetch class leaderboard points for the user's class
      const schoolClassesRes = await fetch(`${baseUrl}${GET_SCHOOL_CLASSES_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify({ name: json.schoolName }),
      });

      if (!schoolClassesRes.ok) {
        const schoolClassesRaw = await schoolClassesRes.text();
        console.warn("Failed /class/school:", schoolClassesRes.status, schoolClassesRaw);
        applyClassPoints(null);
        return;
      }

      const schoolClassesJson =
        (await schoolClassesRes.json()) as GetSchoolClassesResponse;
      const classes = normalizeSchoolClasses(schoolClassesJson);

      const currentClass = classes.find(
        (c) => c.className.trim().toLowerCase() === json.className.trim().toLowerCase(),
      );

      applyClassPoints(currentClass?.points ?? 0);

    } catch (error) {
      console.error("Failed to load points:", error);
    }
  }, [ensureUserId, getApiBaseUrl, registerDevice, setPoints, pointsRequestIdRef]);

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
      <Text style={[themedStyles.subheading, { marginBottom: 10 }]}>
        {t("hello")},
      </Text>
      <Text style={[themedStyles.subheading, { marginBottom: 20 }]}>
        {name ? name : t("welcomeMessage")}!
      </Text>
      <View
        style={[BaseStyles.rowCenter, BaseStyles.gap8, BaseStyles.mb16]}
      >
        <MaterialIcons name="star" size={24} color={Colors.brand.darkYellow} />
        <Text style={themedStyles.subheading}>{t("favoriteCareer")}</Text>
      </View>
      <View style={[BaseStyles.rowCenter, BaseStyles.my16]}>
        <View style={[styles.card, {borderColor: Colors.brand.lightBlue}]}>
          <Text style={[themedStyles.semiboldText, BaseStyles.p8]}>
            {t("you")}:
          </Text>
          {summary?.classCode ? (
          <Text style={[themedStyles.boldText, BaseStyles.textXxxl, BaseStyles.px16]}>
          {points} p
          </Text>
          ) : (
          <Text style={[themedStyles.text, BaseStyles.px16]}>
            {t("noClassPoints")}
          </Text>
          )}
        </View>
        <View style={[styles.card, {borderColor: Colors.brand.lightBlue}]}>
          <Text style={[themedStyles.semiboldText, BaseStyles.p8]}>
            {t("class")}:
          </Text>
          {summary?.classCode ? (
          <Text style={[themedStyles.boldText, BaseStyles.textXxxl, BaseStyles.px16]}>
          {classPoints} p
          </Text>
          ) : (
          <Text style={[themedStyles.text, BaseStyles.px16]}>
            {t("noClassPoints")}
          </Text>
          )}
        </View>
      </View>

      {/* TODO: koble opp mot backend */}
      <Text style={themedStyles.text}>
        {t("findCareers", { count: 5 })}
      </Text>


      {/* Class info / Join class */}
      {summary?.classCode ? (
        <View style={[BaseStyles.rowCenter, BaseStyles.gap16, BaseStyles.m16]}>
          <MaterialIcons name="school" size={35} color={Colors.brand.purple} />
          <Text style={themedStyles.heading}>
            {summary.className ?? t("class")} - {summary.schoolName ?? t("school")}
          </Text>
        </View>
      ) : (
        <Pressable
          style={[themedStyles.button, !isReady && styles.buttonDisabled]}
          onPress={() => setShowJoinClass(true)}
          disabled={!isReady}
        >
          <Text style={themedStyles.buttonText}>{t("joinClass")}</Text>
        </Pressable>
      )}


      <View
        style={[styles.contestCard, BaseStyles.center, {borderColor: Colors.brand.lightBlue}]}
      >
        <Text style={[themedStyles.text, BaseStyles.p8]}>
          {t("contestPeriod")}:
        </Text>
        <Pressable
          onPress={() => setShowContestInfo(true)}
          style={[BaseStyles.p8, {position: "absolute", top: 0, right: 10}]}
          accessibilityRole="button"
          accessibilityLabel="Mer informasjon om konkurransen"
        >
          <MaterialIcons name="info-outline" size={20} color={theme.border} />
        </Pressable>

        <Text style={[themedStyles.subheading, BaseStyles.p8]}>
          15.august - 30.september
        </Text>
        <Text style={[themedStyles.text, BaseStyles.p8]}>
          {t("classQuizStartsIn")}:
        </Text>
        <Text style={[themedStyles.heading, BaseStyles.p8]}>
          14 dager
        </Text>

      <Modal
        visible={showContestInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContestInfo(false)}
      >
        <Pressable
          style={themedStyles.modalBackdrop}
          onPress={() => setShowContestInfo(false)}
        >
          <Pressable style={themedStyles.modalCard} onPress={() => {}}>
            <Text style={[themedStyles.subheading, BaseStyles.mb16]}>
              Om konkurransen
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              Her kan du se perioden for konkurransen og når klassequizen starter.
              Samle poeng ved å fullføre aktiviteter og bidra til klassens totalscore.
            </Text>
            <Pressable
              style={themedStyles.smallButton}
              onPress={() => setShowContestInfo(false)}
            >
              <Text style={themedStyles.buttonText}>{t("closeButton")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      </View>



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
  card: {
    width: '35%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    margin: 10,
  },
  contestCard: {
    width: '80%',
    borderRadius: 8,
    borderWidth: 2,
    margin: 10,
  },
});

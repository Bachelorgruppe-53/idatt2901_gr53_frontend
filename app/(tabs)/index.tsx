import {
  loadCompetition,
  type CompetitionInfo,
} from "@/services/home/loadCompetition";
import AboutCareer from "@/src/components/careers/aboutCareer";
import { JoinClassModal } from "@/src/components/joinClass";
import { QRScanner, type QRScanPayload } from "@/src/components/QRScanner";
import { Colors } from "@/src/constants/Colors";
import { BaseStyles } from "@/src/constants/Styles";
import { useHomeData } from "@/src/hooks/useHomeData";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COMPETITION_DEBUG = __DEV__;

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
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation("home");

  // Data management
  const { name, points, summary, classPoints, favoriteCareer, reload } =
    useHomeData();

  // QR Scanner
  const { isScanning, startScanning, stopScanning, permission } =
    useQRScanner();

  // Modal states
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [showContestInfo, setShowContestInfo] = useState(false);
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [remountKey, setRemountKey] = useState(0);
  const [competition, setCompetition] = useState<CompetitionInfo | null>(null);

  const formatCompetitionDate = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language ?? "en", {
        day: "numeric",
        month: "long",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );

  const parseCompetitionDate = (value: string): Date | null => {
    const trimmed = value.trim();

    // Backend can return datetimes like "2026-3-30T08:00" which Android
    // may not parse consistently via Date(string). Parse manually first.
    const match = trimmed.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
    );

    let parsed: Date;
    if (match) {
      const [, y, m, d, hh, mm, ss] = match;
      parsed = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(hh),
        Number(mm),
        ss ? Number(ss) : 0,
      );
    } else {
      parsed = new Date(trimmed);
    }

    const isValid = !Number.isNaN(parsed.getTime());
    if (COMPETITION_DEBUG) {
      console.log("[home] parseCompetitionDate", {
        input: value,
        parsed: isValid ? parsed.toISOString() : null,
        valid: isValid,
      });
    }
    return isValid ? parsed : null;
  };

  const competitionTitle = competition?.title ?? t("classCompetition");

  const startDate = competition
    ? parseCompetitionDate(competition.startTime)
    : null;
  const endDate = competition
    ? parseCompetitionDate(competition.endTime)
    : null;

  const competitionPeriod =
    startDate && endDate
      ? `${formatCompetitionDate.format(startDate)} - ${formatCompetitionDate.format(endDate)}`
      : t("competitionPeriodFallback");

  const classQuizStartsIn = (() => {
    if (!competition) return t("competitionStartsFallback");

    if (competition.active) {
      return t("contestActive", "Pågår nå");
    }

    if (!startDate) return "-";

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilStart = Math.max(
      0,
      Math.ceil((startDate.getTime() - Date.now()) / msPerDay),
    );

    return `${daysUntilStart} ${t("days")}`;
  })();

  useEffect(() => {
    if (!COMPETITION_DEBUG) return;

    console.log("[home] competition derived", {
      competition,
      competitionTitle: competition?.title,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      competitionPeriod,
      classQuizStartsIn,
    });
  }, [
    competition,
    competitionTitle,
    startDate,
    endDate,
    competitionPeriod,
    classQuizStartsIn,
  ]);

  useEffect(() => {
    let isMounted = true;
    const language = i18n.resolvedLanguage ?? i18n.language;

    if (COMPETITION_DEBUG) {
      console.log("[home] loadCompetition effect start", {
        language,
      });
    }

    const load = async () => {
      const data = await loadCompetition(language);
      if (!isMounted) return;
      if (COMPETITION_DEBUG) {
        console.log("[home] loadCompetition effect result", data);
      }
      setCompetition(data);
    };

    void load();

    return () => {
      isMounted = false;
      if (COMPETITION_DEBUG) {
        console.log("[home] loadCompetition effect cleanup");
      }
    };
  }, [i18n.language, i18n.resolvedLanguage]);

  const handleScan = (payload: QRScanPayload) => {
    console.log("Scanned QR code:", payload);
    setSelectedCareerId(payload.careerId);
    setShowCareerModal(true);
    stopScanning();
  };

  const handleInvalidScan = () => {
    alert(t("invalidQR"));
  };

  const showCameraSettingsAlert = () => {
    Alert.alert(
      t("cameraPermissionDeniedTitle", "Camera access needed"),
      t(
        "cameraPermissionDeniedMessage",
        "Camera access has been denied. Open Settings to grant permission.",
      ),
      [
        {
          text: t("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("openSettings", "Open settings"),
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ],
    );
  };

  const handleQRPress = async () => {
    const started = await startScanning();
    if (
      !started &&
      permission &&
      !permission.granted &&
      permission.canAskAgain === false
    ) {
      showCameraSettingsAlert();
    }
  };

  if (isScanning) {
    return (
      <QRScanner
        onScan={handleScan}
        onInvalidScan={handleInvalidScan}
        onClose={stopScanning}
      />
    );
  }

  if (showJoinClass) {
    return (
      <JoinClassModal
        onClose={() => setShowJoinClass(false)}
        onJoined={() => {
          void reload();
          setRemountKey((prev) => prev + 1);
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
          setSelectedCareerId(null);
        }}
      />
    );
  }

  return (
    <View key={remountKey} style={themedStyles.container}>
      <Pressable
        onPress={() => setShowGameInfo(true)}
        style={({ pressed }) => ({
          position: "absolute",
          top: insets.top + 8,
          right: 16,
          zIndex: 20,
          opacity: pressed ? 0.7 : 1,
          padding: 8,
        })}
        accessibilityRole="button"
        accessibilityLabel="Game info"
      >
        <MaterialIcons name="info-outline" size={24} color={theme.border} />
      </Pressable>

      <Text style={[themedStyles.heading, { marginBottom: 10 }]}>
        {t("hello")},
      </Text>
      <Text style={[themedStyles.heading, { marginBottom: 20 }]}>
        {name ? name : t("welcomeMessage")}!
      </Text>
      <View style={[BaseStyles.rowCenter, BaseStyles.gap8, BaseStyles.mb16]}>
        <MaterialIcons name="star" size={24} color={Colors.brand.darkYellow} />
        <Text style={themedStyles.subheading}>
          {favoriteCareer?.title ?? t("noFavoriteCareer")}
        </Text>
      </View>
      <View style={styles.cardContainer}>
        <View style={[styles.card, { borderColor: Colors.brand.lightBlue }]}>
          <Text style={[themedStyles.semiboldText, BaseStyles.p8]}>
            {t("you")}:
          </Text>
          {summary?.classCode ? (
            <Text
              style={[
                themedStyles.boldText,
                BaseStyles.textXxxl,
                BaseStyles.px16,
              ]}
            >
              {points}
            </Text>
          ) : (
            <Text style={[themedStyles.text, BaseStyles.px16]}>
              {t("noClassPoints")}
            </Text>
          )}
        </View>
        <View style={[styles.card, { borderColor: Colors.brand.lightBlue }]}>
          <Text style={[themedStyles.semiboldText, BaseStyles.p8]}>
            {t("class")}:
          </Text>
          {classPoints !== null ? (
            <Text
              style={[
                themedStyles.boldText,
                BaseStyles.textXxxl,
                BaseStyles.px16,
              ]}
            >
              {classPoints ?? 0}
            </Text>
          ) : (
            <Text style={[themedStyles.text, BaseStyles.px16]}>
              {t("noClassPoints")}
            </Text>
          )}
        </View>
      </View>

      <Text style={themedStyles.text}>
        {t("findCareers", { count: summary?.numberOfClaims ?? 0 })}
      </Text>

      {/* Class info / Join class */}
      {summary?.classCode ? (
        <View style={[BaseStyles.rowCenter, BaseStyles.gap16, BaseStyles.m16]}>
          <MaterialIcons name="school" size={35} color={Colors.brand.purple} />
          <Text style={themedStyles.heading}>
            {summary.className ?? t("class")} -{" "}
            {summary.schoolName ?? t("school")}
          </Text>
        </View>
      ) : (
        <Pressable
          style={themedStyles.button}
          onPress={() => setShowJoinClass(true)}
        >
          <Text style={themedStyles.buttonText}>{t("joinClass")}</Text>
        </Pressable>
      )}

      <View
        style={[
          styles.contestCard,
          BaseStyles.center,
          { borderColor: Colors.brand.lightBlue },
        ]}
      >
        <Text style={[themedStyles.subheading, BaseStyles.p8]}>
          {competitionTitle}
        </Text>

        <Text style={[themedStyles.text, BaseStyles.p8]}>
          {t("contestPeriod")}:
        </Text>
        <Pressable
          onPress={() => setShowContestInfo(true)}
          style={[BaseStyles.p8, { position: "absolute", top: 0, right: 10 }]}
          accessibilityRole="button"
          accessibilityLabel={t("contestInfoLabel")}
        >
          <MaterialIcons name="info-outline" size={20} color={theme.border} />
        </Pressable>

        <Text style={[themedStyles.subheading, BaseStyles.p8]}>
          {competitionPeriod}
        </Text>
        {/* 
        <Text style={[themedStyles.text, BaseStyles.p8]}>
          {t("classQuizStartsIn")}:
        </Text>
        <Text style={[themedStyles.heading, BaseStyles.p8]}>
          {classQuizStartsIn}
        </Text> 
        */}

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
                {competition?.title ?? t("competitionInfoTitle")}
              </Text>
              <Text style={[themedStyles.text, BaseStyles.mb16]}>
                {t("competitionInfoGeneric")}
                {"\n"}
                {"\n"}
                {t("competitionOnArea") + " "}
                <Text style={themedStyles.boldText}>
                  {competition?.area ?? t("notAvailable")}
                </Text>
                {" " + t("competitionFrom") + " "}
                <Text style={themedStyles.boldText}>
                  {startDate
                    ? formatCompetitionDate.format(startDate)
                    : t("notAvailable")}
                </Text>
                {" " + t("competitionTo") + " "}
                <Text style={themedStyles.boldText}>
                  {endDate
                    ? formatCompetitionDate.format(endDate)
                    : t("notAvailable")}
                </Text>
                {". "}
                {competition?.active
                  ? t("competitionActiveMessage")
                  : t("competitionStartsMessage", {
                      startsIn: classQuizStartsIn,
                    })}
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

      <Modal
        visible={showGameInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGameInfo(false)}
      >
        <Pressable
          style={themedStyles.modalBackdrop}
          onPress={() => setShowGameInfo(false)}
        >
          <Pressable style={themedStyles.modalCard} onPress={() => {}}>
            <Text style={[themedStyles.subheading, BaseStyles.mb16]}>
              {t("gameInfoTitle", "How the game works")}
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              {t(
                "gameInfoBody",
                "Find careers around the map, complete the quiz to unlock points, and use the class overview to compare progress with your classmates.",
              )}
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              {t(
                "gameInfoDetail1",
                "1. Join a class to see your ranking and class points.",
              )}
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              {t(
                "gameInfoDetail2",
                "2. Scan a QR code or open a career from the map.",
              )}
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              {t(
                "gameInfoDetail3",
                "3. Answer the quiz questions correctly to earn points.",
              )}
            </Text>
            <Text style={[themedStyles.text, BaseStyles.mb16]}>
              {t(
                "gameInfoDetailPoints",
                "Tip! The quicker you answer correctly, the more points you earn!",
              )}
            </Text>
            <Pressable
              style={themedStyles.smallButton}
              onPress={() => setShowGameInfo(false)}
            >
              <Text style={themedStyles.buttonText}>{t("closeButton")}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Pressable style={themedStyles.buttonRound} onPress={handleQRPress}>
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
  cardContainer: {
    width: "80%",
    marginHorizontal: 10,
    flexDirection: "row",
    gap: "6%",
    paddingBottom: 16,
  },
  card: {
    width: "47%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 2,
    paddingBottom: 10,
  },
  contestCard: {
    width: "80%",
    borderRadius: 8,
    borderWidth: 2,
    margin: 10,
  },
});

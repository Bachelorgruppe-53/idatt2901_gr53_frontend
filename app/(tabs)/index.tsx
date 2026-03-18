import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JoinClassModal } from "@/src/components/joinClass";
import { QRScanner } from "@/src/components/QRScanner";
import AboutCareer from "@/src/components/careers/aboutCareer";
import { Colors } from "@/src/constants/Colors";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useHomeData } from "@/src/hooks/useHomeData";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("home");

  // Data management
  const { name, points, summary, classPoints, reload } = useHomeData();

  // QR Scanner
  const { isScanning, startScanning, stopScanning } = useQRScanner();

  // Modal states
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [showContestInfo, setShowContestInfo] = useState(false);
  const [remountKey, setRemountKey] = useState(0);

  const handleScan = (data: string) => {
    console.log("Scanned QR code:", data);
    stopScanning();
    // TODO: Handle QR scan logic
  };

  const handleQRPress = async () => {
    startScanning();
  };

  if (isScanning) {
    return (
      <QRScanner
        onScan={handleScan}
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
          {classPoints ?? 0} p
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
          style={themedStyles.button}
          onPress={() => setShowJoinClass(true)}
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
        style={themedStyles.buttonRound}
        onPress={handleQRPress}
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

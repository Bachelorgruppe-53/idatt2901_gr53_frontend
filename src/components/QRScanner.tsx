import { MaterialIcons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import { useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { useTranslation } from "react-i18next";

/**
 * QRScanner component that uses the device camera to scan QR codes.
 * @returns JSX.Element
 */

interface QRScannerProps {
  onScan: (data: QRScanPayload) => void;
  onInvalidScan?: () => void;
  onClose: () => void;
}

export type QRScanPayload = {
  type: "career";
  careerId: number;
};

const QR_SCAN_THROTTLE_MS = 1000;

const isQRScanPayload = (value: unknown): value is QRScanPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as { type?: unknown; careerId?: unknown };

  return (
    payload.type === "career" &&
    typeof payload.careerId === "number" &&
    Number.isInteger(payload.careerId) &&
    payload.careerId > 0
  );
};

const parseQRScanPayload = (data: string): QRScanPayload | null => {
  try {
    const parsed = JSON.parse(data) as unknown;
    return isQRScanPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export function QRScanner({ onScan, onInvalidScan, onClose }: QRScannerProps) {
  const themedStyles = useThemedStyles();
  const lastScanAtRef = useRef(0);
  const { t } = useTranslation("qrScanner");

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    const now = Date.now();
    if (now - lastScanAtRef.current < QR_SCAN_THROTTLE_MS) {
      return;
    }

    lastScanAtRef.current = now;

    const payload = parseQRScanPayload(data);
    if (payload) {
      onScan(payload);
      return;
    }

    onInvalidScan?.();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Overlay must be outside CameraView */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.unfocusedContainer} />
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.focusedContainer} />
          <View style={styles.unfocusedContainer} />
        </View>
        <View style={styles.unfocusedContainer} />
      </View>

      <Pressable style={themedStyles.closeButton} 
        onPress={onClose}
        accessibilityLabel={t("closeQRScanner")}>
        <MaterialIcons name="close" size={30} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
  },
  middleContainer: {
    flexDirection: "row",
    height: 200,
  },
  focusedContainer: {
    width: 200,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

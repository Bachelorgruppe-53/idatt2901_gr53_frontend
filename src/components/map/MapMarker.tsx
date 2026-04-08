import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from "react-native-maps";
import { Colors } from "../../constants/Colors";
import { MapLocation } from "../map/mapData";

/**
 * This component represents a map marker with a callout that allows users to open the QR scanner.
 *
 * @param location - The location data for the marker.
 * @param onScan - Function to call when the scan button is pressed.
 * @returns JSX.Element
 */

interface Props {
  location: MapLocation;
  onScan: () => void;
}

export const MapMarker = ({ location, onScan }: Props) => {
  const { t } = useTranslation("map");

  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      pinColor={location.color || Colors.brand.green}
    >
      <Callout onPress={onScan}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{location.title}</Text>
          <Text style={styles.calloutDescription}>{location.place}</Text>
          <View style={styles.scanButton}>
            <Text style={styles.scanButtonText}>{t("openQRScanner")} →</Text>
          </View>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  calloutContainer: { padding: 10, width: 200 },
  calloutTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  calloutDescription: { fontSize: 12, color: "#666", marginBottom: 10 },
  scanButton: {
    backgroundColor: "#002e5d",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  scanButtonText: { color: "white", fontWeight: "600", fontSize: 14 },
});

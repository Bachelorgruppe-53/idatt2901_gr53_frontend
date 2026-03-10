import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE
} from "react-native-maps";
import { Colors } from "../../constants/Colors";
import { useTheme } from "../../context/ThemeContext";
import { QRScanner } from "../QRScanner";
import { fetchLocations, MapLocation } from "./mapData";
import { MapMarker } from "./MapMarker";
import { AreaSelector } from "./areaDropdown";

/**
 * This component displays a map with markers and allows users to scan QR codes to unlock careers.
 * The map centers on St. Olavs Hospital by default and can be filtered by area. When a marker is tapped, a callout appears with an option to open the QR scanner.
 * When the area is changed, the map updates to show locations relevant to that area. The map also includes custom zoom controls for iOS.
 *
 * @returns JSX.Element
 */

interface MapProps {
  style?: ViewStyle;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onScanPress?: () => void;
}

const AREAS = [
  // todo: fetch areas from backend instead of hardcoding
  { id: "all", name: "Alle områder", value: null },
  { id: "st-olavs", label: "St. Olavs Hospital", value: "St. Olavs hospital" },
  { id: "roros", label: "Røros", value: "Røros" },

]

export const MapComponent = ({
  style,
  initialLocation,
  onScanPress,
}: MapProps) => {
  const { isDarkMode } = useTheme();
  const themedStyles = useThemedStyles();
  const { isScanning, startScanning, stopScanning } = useQRScanner();

  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>("St. Olavs hospital");
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Load locations from backend on area change
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      const fetchedLocations = await fetchLocations(selectedArea);
      setLocations(fetchedLocations);
      setIsLoading(false);
    };

    void loadLocations();
  }, [selectedArea]);

  const handleScan = useCallback(
    (data: string) => {
      stopScanning();
      alert(`Skannet data: ${data}`);
    },
    [stopScanning],
  );

  // Auto-zoom map to fit all markers when locations change or map is ready
  const fitMapToLocations = useCallback(() => {
    if (!mapRef.current || locations.length === 0) return;

    const coordinates = locations.map((loc) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    if (coordinates.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        350,
      );
      return;
    }

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 120, right: 60, bottom: 180, left: 60 },
      animated: true,
    });
  }, [locations]);

  // Re-fit map whenever locations or map readiness changes
  useEffect(() => {
    if (!isMapReady) return;
    const timer = setTimeout(() => {
      fitMapToLocations();
    }, 200);

    return () => clearTimeout(timer);
  }, [isMapReady, locations, fitMapToLocations]);

  const handleZoom = async (zoomIn: boolean) => {
    if (!mapRef.current) return;

    const camera = await mapRef.current.getCamera();
    if (Platform.OS === "ios" && camera.altitude !== undefined) {
      camera.altitude /= zoomIn ? 2 : 0.5;
    } else if (camera.zoom !== undefined) {
      camera.zoom += zoomIn ? 1 : -1;
    }

    mapRef.current.animateCamera(camera, { duration: 300 });
  };

  const selectedAreaLabel =
    AREAS.find((a) => a.value === selectedArea)?.label || "Select Area";


  if (isScanning) {
    return <QRScanner onScan={handleScan} onClose={stopScanning} />;
  }

  return (
    <View style={themedStyles.container}>
      <AreaSelector
        areas={AREAS}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
      />

      <MapView
        ref={mapRef}
        onMapReady={() => setIsMapReady(true)}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        zoomControlEnabled={Platform.OS === "android"}
        showsCompass={true}
        style={styles.map}
        userInterfaceStyle={isDarkMode ? "dark" : "light"}
      >
        {locations.map((loc, index) => (
          <MapMarker
            key={loc.id}
            location={loc}
            onScan={() => startScanning()}
          />
        ))}
      </MapView>

      {/* Custom Zoom-kontroller for iOS */}
      {Platform.OS === "ios" && (
        <View style={styles.zoomButtonsContainer}>
          <Pressable style={styles.zoomButton} onPress={() => handleZoom(true)}>
            <Text style={styles.zoomText}>+</Text>
          </Pressable>
          <Pressable
            style={styles.zoomButton}
            onPress={() => handleZoom(false)}
          >
            <Text style={styles.zoomText}>−</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  zoomButtonsContainer: {
    position: "absolute",
    bottom: 100,
    right: 15,
    gap: 10,
  },
  zoomButton: {
    backgroundColor: "white",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomText: {
    fontSize: 28,
    color: Colors.brand.darkBlue,
    marginTop: -3, // Finjustering for sentrering av "+"
  },
});

import { AreaSelector } from "@/src/components/map/areaDropdown";
import { fetchLocations, MapLocation } from "@/src/components/map/mapData";
import { MapMarker } from "@/src/components/map/MapMarker";
import { QRScanner, type QRScanPayload } from "@/src/components/QRScanner";
import { Colors } from "@/src/constants/Colors";
import { useTheme } from "@/src/context/ThemeContext";
import { useQRScanner } from "@/src/hooks/useQRScanner";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

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
];

export const MapComponent = ({
  style,
  initialLocation,
  onScanPress,
}: MapProps) => {
  const { isDarkMode } = useTheme();
  const themedStyles = useThemedStyles();
  const { isScanning, startScanning, stopScanning } = useQRScanner();
  const { i18n } = useTranslation();
  const { t } = useTranslation("map");

  const controlBackgroundColor = isDarkMode
    ? "rgba(28,28,30,0.92)"
    : "rgba(255,255,255,0.92)";
  const controlIconColor = isDarkMode ? "#F2F2F7" : Colors.brand.darkBlue;
  const loadingBackgroundColor = isDarkMode
    ? "rgba(28,28,30,0.9)"
    : "rgba(255,255,255,0.9)";

  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(
    "St. Olavs hospital",
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const watchIdRef = useRef<number | null>(null);

  // Load locations from backend on area change
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      const language = i18n.resolvedLanguage ?? i18n.language;
      const fetchedLocations = await fetchLocations(selectedArea, language);
      setLocations(fetchedLocations);
      setIsLoading(false);
    };

    void loadLocations();
  }, [selectedArea, i18n.language, i18n.resolvedLanguage]);

  const handleScan = useCallback(
    (payload: QRScanPayload) => {
      stopScanning();
      alert(`Skannet data: ${JSON.stringify(payload)}`);
    },
    [stopScanning],
  );

  const handleInvalidScan = useCallback(() => {
    alert(t("invalidQRCode"));
  }, [t]);

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

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === "ios") {
      const status = await Geolocation.requestAuthorization("whenInUse");
      return status === "granted";
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: t("locationPermissionTitle"),
        message: t("locationPermissionMessage"),
        buttonNeutral: t("locationPermissionAskLater"),
        buttonNegative: t("locationPermissionCancel"),
        buttonPositive: t("locationPermissionAccept"),
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }, [t]);

  useEffect(() => {
    const startLocationTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      watchIdRef.current = Geolocation.watchPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setUserLocation(nextLocation);
        },
        (error) => {
          console.log("Geolocation error", error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 5000,
          fastestInterval: 2000,
          showLocationDialog: true,
        },
      );
    };

    void startLocationTracking();

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      Geolocation.stopObserving();
    };
  }, [requestLocationPermission]);

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

  const centerOnUserLocation = useCallback(() => {
    if (!mapRef.current || !userLocation) return;

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      100,
    );
  }, [userLocation]);

  if (isScanning) {
    return (
      <QRScanner
        onScan={handleScan}
        onInvalidScan={handleInvalidScan}
        onClose={stopScanning}
      />
    );
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
        showsUserLocation={true}
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

      {isLoading && (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: loadingBackgroundColor },
          ]}
        >
          <ActivityIndicator size="small" color={controlIconColor} />
        </View>
      )}

      <View style={styles.controlsContainer}>
        <Pressable
          style={[
            styles.controlButton,
            { backgroundColor: controlBackgroundColor },
          ]}
          onPress={() => handleZoom(true)}
          accessibilityRole="button"
          accessibilityLabel={t("zoomIn")}
        >
          <FontAwesome6 name="add" size={20} color={controlIconColor} />
        </Pressable>
        <Pressable
          style={[
            styles.controlButton,
            { backgroundColor: controlBackgroundColor },
          ]}
          onPress={() => handleZoom(false)}
          accessibilityRole="button"
          accessibilityLabel={t("zoomOut")}
        >
          <FontAwesome6 name="minus" size={20} color={controlIconColor} />
        </Pressable>
        <Pressable
          style={[
            styles.controlButton,
            { backgroundColor: controlBackgroundColor },
            !userLocation ? styles.controlButtonDisabled : null,
          ]}
          onPress={centerOnUserLocation}
          disabled={!userLocation}
          accessibilityRole="button"
          accessibilityLabel={t("centerOnUserLocation")}
        >
          <FontAwesome6
            name={userLocation ? "location-arrow" : "location-arrow"}
            size={20}
            color={controlIconColor}
          />
        </Pressable>
      </View>
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
  loadingContainer: {
    position: "absolute",
    top: 70,
    right: 15,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 100,

    right: 15,
    gap: 10,
  },
  controlButton: {
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
  controlButtonDisabled: {
    opacity: 0.45,
  },
});

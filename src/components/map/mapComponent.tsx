import AboutCareer from "@/src/components/careers/aboutCareer";
import { AreaSelector } from "@/src/components/map/areaDropdown";
import {
  fetchAreas,
  fetchLocations,
  MapArea,
  MapLocation,
} from "@/src/components/map/mapData";
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
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

type ExpoLocationModule = typeof import("expo-location");

let cachedLocationModule: ExpoLocationModule | null = null;

const getLocationModule = (): ExpoLocationModule | null => {
  if (cachedLocationModule) {
    return cachedLocationModule;
  }

  try {
    cachedLocationModule = require("expo-location") as ExpoLocationModule;
    return cachedLocationModule;
  } catch {
    return null;
  }
};

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

/**
 * MapComponent is the main component responsible for rendering the map view, handling user interactions such as area selection
 * and QR code scanning, and managing the state related to map areas, locations, loading status, and user location.
 *
 * @param param0 The props for the MapComponent, including optional style, initial location for centering the map, and a callback for when the scan button is pressed.
 * @returns JSX.Element
 */
export const MapComponent = ({
  style,
  initialLocation,
  onScanPress,
}: MapProps) => {
  const { isDarkMode } = useTheme();
  const themedStyles = useThemedStyles();
  const { isScanning, startScanning, stopScanning, permission } =
    useQRScanner();
  const { i18n } = useTranslation();
  const { t } = useTranslation("map");
  const showCameraSettingsAlert = useCallback(() => {
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
  }, [t]);

  const controlBackgroundColor = isDarkMode
    ? "rgba(28,28,30,0.92)"
    : "rgba(255,255,255,0.92)";
  const controlIconColor = isDarkMode ? "#F2F2F7" : Colors.brand.darkBlue;
  const loadingBackgroundColor = isDarkMode
    ? "rgba(28,28,30,0.9)"
    : "rgba(255,255,255,0.9)";

  const [areas, setAreas] = useState<MapArea[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const cameraStateRef = useRef<any>(null);
  const fallbackRegion = {
    latitude: initialLocation?.latitude ?? 63.4212,
    longitude: initialLocation?.longitude ?? 10.3951,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const areaOptions: MapArea[] = [
    { id: "all", label: t("allAreas"), value: null },
    ...areas,
  ];

  useEffect(() => {
    const loadAreas = async () => {
      const language = i18n.resolvedLanguage ?? i18n.language;
      const fetchedAreas = await fetchAreas(language);
      setAreas(fetchedAreas);
    };

    void loadAreas();
  }, [i18n.language, i18n.resolvedLanguage]);

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
      setSelectedCareerId(payload.careerId);
      setShowCareerModal(true);
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
      cameraStateRef.current = null;
      fitMapToLocations();
    }, 200);

    return () => clearTimeout(timer);
  }, [isMapReady, locations, fitMapToLocations]);

  // Save camera state before opening scanner, restore on close
  const saveCameraStateAndStartScanning = useCallback(async () => {
    if (mapRef.current && isMapReady) {
      try {
        const camera = await mapRef.current.getCamera();
        cameraStateRef.current = {
          center: camera.center,
          pitch: camera.pitch,
          heading: camera.heading,
          altitude: camera.altitude,
          zoom: camera.zoom,
        };
      } catch (error) {
        console.warn("Failed to capture camera state", error);
      }
    }

    const started = await startScanning();
    if (
      !started &&
      permission &&
      !permission.granted &&
      permission.canAskAgain === false
    ) {
      showCameraSettingsAlert();
    }
  }, [isMapReady, permission, showCameraSettingsAlert, startScanning]);

  useEffect(() => {
    const restoreCameraState = async () => {
      if (
        !isScanning &&
        mapRef.current &&
        isMapReady &&
        cameraStateRef.current
      ) {
        try {
          await mapRef.current.animateCamera(cameraStateRef.current, {
            duration: 300,
          });
        } catch (error) {
          console.warn("Failed to restore camera state", error);
        }
      }
    };

    if (!isScanning) {
      const timer = setTimeout(() => {
        restoreCameraState();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isScanning, isMapReady]);

  const requestLocationPermission = useCallback(async () => {
    const location = getLocationModule();
    if (!location) {
      return false;
    }

    const permission = await location.requestForegroundPermissionsAsync();

    if (permission.status === "granted") {
      return true;
    }

    Alert.alert(t("locationPermissionTitle"), t("locationPermissionMessage"));

    return false;
  }, [t]);

  useEffect(() => {
    let isActive = true;

    const loadCurrentLocation = async () => {
      try {
        const location = getLocationModule();
        if (!location) return;

        const hasPermission = await requestLocationPermission();
        if (!hasPermission || !isActive) return;

        const position = await location.getCurrentPositionAsync({
          accuracy: location.Accuracy.Highest,
          mayShowUserSettingsDialog: true,
        });

        if (!isActive) return;

        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch (error) {
        console.warn("Failed to load current location", error);
      }
    };

    void loadCurrentLocation();

    return () => {
      isActive = false;
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

  const handleAreaReselect = useCallback(() => {
    cameraStateRef.current = null;
    fitMapToLocations();
  }, [fitMapToLocations]);

  if (isScanning) {
    return (
      <QRScanner
        onScan={handleScan}
        onInvalidScan={handleInvalidScan}
        onClose={stopScanning}
      />
    );
  }

  if (showCareerModal && selectedCareerId !== null) {
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
    <View style={[themedStyles.container, style]}>
      <AreaSelector
        areas={areaOptions}
        selectedArea={selectedArea}
        onAreaChange={setSelectedArea}
        onAreaReselect={handleAreaReselect}
      />

      <MapView
        ref={mapRef}
        onMapReady={() => setIsMapReady(true)}
        initialRegion={fallbackRegion}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        mapType="standard"
        zoomControlEnabled={Platform.OS === "android"}
        showsCompass={true}
        showsUserLocation={Boolean(userLocation)}
        style={styles.map}
        userInterfaceStyle={isDarkMode ? "dark" : "light"}
      >
        {locations.map((loc, index) => (
          <MapMarker
            key={loc.id}
            location={loc}
            onScan={saveCameraStateAndStartScanning}
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

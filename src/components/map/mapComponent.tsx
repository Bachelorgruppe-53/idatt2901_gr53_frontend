import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Camera } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';
import { useCameraPermissions } from "expo-camera";
import { QRScanner } from '../QRScanner';
import { locations } from './mapData';
import { MapMarker } from './MapMarker';

/**
 * This component displays a map with markers and allows users to scan QR codes to unlock careers.
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

export const MapComponent = ({ style, initialLocation, onScanPress }: MapProps) => {
  const { isDarkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Ref for å få tilgang til kart-metoder (som zoom)
  const mapRef = useRef<MapView>(null);

  const handleScan = (data: string) => {
    setIsScanning(false);
    alert(`Skannet data: ${data}`);
  };

  // Funksjon for manuell zooming (løser manglende knapper på iOS)
  const handleZoom = async (zoomIn: boolean) => {
    if (!mapRef.current) return;

    const camera = await mapRef.current.getCamera();
    if (Platform.OS === 'ios' && camera.altitude !== undefined) {
      // Apple Maps bruker altitude (høyde over bakken)
      camera.altitude /= zoomIn ? 2 : 0.5;
    } else if (camera.zoom !== undefined) {
      // Google Maps bruker zoom-nivå (0-20)
      camera.zoom += zoomIn ? 1 : -1;
    }

    mapRef.current.animateCamera(camera, { duration: 300 });
  };

  if (isScanning) {
    if (!permission?.granted) {
      requestPermission();
      return null;
    }
    return (
      <QRScanner onScan={handleScan} onClose={() => setIsScanning(false)} />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        zoomControlEnabled={Platform.OS === 'android'} // Beholder standard på Android
        showsCompass={true}
        style={styles.map}
        userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
        initialRegion={{
          latitude: initialLocation?.latitude ?? 63.420377,
          longitude: initialLocation?.longitude ?? 10.390158,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {locations.map((loc, index) => (
          <MapMarker 
            key={loc.id} 
            location={loc} 
            onScan={() => setIsScanning(true)} 
          />
        ))}   
      </MapView>     

      {/* Custom Zoom-kontroller for iOS */}
      {Platform.OS === 'ios' && (
        <View style={styles.zoomButtonsContainer}>
          <Pressable style={styles.zoomButton} onPress={() => handleZoom(true)}>
            <Text style={styles.zoomText}>+</Text>
          </Pressable>
          <Pressable style={styles.zoomButton} onPress={() => handleZoom(false)}>
            <Text style={styles.zoomText}>−</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    padding: 10,
    width: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: Colors.brand.darkBlue,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  zoomButtonsContainer: {
    position: 'absolute',
    bottom: 100,
    right: 15,
    gap: 10,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
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
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';
import { useCameraPermissions } from "expo-camera";
import { QRScanner } from './QRScanner';
import { useState } from 'react';

// Ved å bruke interface kan du sende inn koordinater eller stil utenfra
interface MapProps {
  style?: ViewStyle;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onScanPress?: () => void; // Callback for når "Scan QR" trykkes
}

export const MapComponent = ({ style, initialLocation, onScanPress }: MapProps) => {
  const { isDarkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
  
    const handleScan = (data: string) => {
      setIsScanning(false);
      alert(`Skannet data: ${data}`);
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
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // Bruk Google Maps på Android men fungerer ikke enda
        zoomControlEnabled={true}
        showsCompass={true}
        style={styles.map}
        userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
        //customMapStyle={isDarkMode ? darkMapStyle : []} --- android greier
        initialRegion={{
          latitude: initialLocation?.latitude ?? 63.420377,
          longitude: initialLocation?.longitude ?? 10.390158,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker 
          coordinate={{ 
            latitude: initialLocation?.latitude ?? 63.4305, 
            longitude: initialLocation?.longitude ?? 10.3951 
          }} 
        />
        <Marker 
          coordinate={{ 
            latitude: initialLocation?.latitude ?? 63.420128, 
            longitude: initialLocation?.longitude ?? 10.387826
          }}
          pinColor={Colors.brand.green}
        >
          <Callout onPress={onScanPress}>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>Sykepleier</Text>
              <Text style={styles.calloutDescription}>Scann stolpen i 2. etasje for å låse opp yrket</Text>
              <Pressable style={styles.scanButton} 
              onPress={() => setIsScanning(true)}>
                <Text style={styles.scanButtonText}>Åpne QR-skanner →</Text>
              </Pressable>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
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
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
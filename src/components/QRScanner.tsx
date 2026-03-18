import { MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from "../constants/Colors";
import { useThemedStyles } from '../hooks/useStyleSheet';

/**
 * QRScanner component that uses the device camera to scan QR codes.
 * @returns JSX.Element
 */

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const themedStyles = useThemedStyles();
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    onScan(data);
  }

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

      <Pressable style={themedStyles.closeButton} onPress={onClose}>
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
    justifyContent: 'center' 
  },
  middleContainer: {
    flexDirection: 'row', 
    height: 200 
  },
  focusedContainer: { 
    width: 200, 
    borderWidth: 2, 
    borderColor: 'white', 
    backgroundColor: 'transparent' 
  },
  unfocusedContainer: { 
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
});

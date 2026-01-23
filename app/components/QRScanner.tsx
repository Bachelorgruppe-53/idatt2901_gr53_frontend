import { MaterialIcons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Colors } from "../constants/Colors";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={({ data }) => onScan(data)}
      >
        {/* Et enkelt sikte i midten */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}></View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={30} color="white" />
        </Pressable>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.brand.black + '20', justifyContent: 'center' },
  middleContainer: { flexDirection: 'row', height: 200 },
  focusedContainer: { width: 200, borderWidth: 2, borderColor: 'white', backgroundColor: 'transparent' },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
  },
});
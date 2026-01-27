import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { Colors } from '../constants/Colors';
import { useTheme } from '../context/ThemeContext';


// Ved å bruke interface kan du sende inn koordinater eller stil utenfra
interface MapProps {
  style?: ViewStyle;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const MapComponent = ({ style, initialLocation }: MapProps) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        userInterfaceStyle={isDarkMode ? 'dark' : 'light'}
        //customMapStyle={isDarkMode ? darkMapStyle : []}
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
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Fyller hele containeren den ligger i
  },
});
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * This component displays information about a selected career.
 * 
 * @param careerName - The name of the career to display information about.
 * @param onClose - Function to call when closing the about career view.
 * 
 * @returns JSX.Element
 */

//TODO: populate with real career data

interface Props {
  careerName: string | null;
  onClose: () => void;
}

export default function AboutCareer({ careerName, onClose }: Props) {
  const theme = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: theme.text }]}>Om {careerName}</Text>
        <Text style={[styles.description, { color: theme.text }]}>
          Dette er en placeholder-side for informasjon om yrket. 
          Her kan du senere legge inn lønn, utdanning og arbeidsoppgaver.
        </Text>
        
        <Pressable onPress={onClose}>
          <Text style={[styles.link, {color: theme.button }]}>Lukk</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: { 
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1 
  },
  title: { 
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  description: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 40 
  },
  link: { 
    fontSize: 16, 
    textDecorationLine: 'underline', 
  },

});
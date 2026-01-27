import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

import Careers from "../../src/components/unlockedCareers"; 
import Achievements from "../../src/components/unlockedAchievements";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { Colors } from "../../src/constants/Colors";

/**
 * This screen allows users to toggle between viewing unlocked careers and achievements.
 * 
 * @returns JSX.Element
 */

export default function AchievementScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
    
      <View style={styles.content}>
        {selectedIndex === 0 ? (
          <Careers /> 
        ) : (
          <Achievements />
        )}
      </View>

      <View style={styles.header}>
        <SegmentedControl
          values={['Karrierer', 'Merker']}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          backgroundColor={theme.backgroundSecondary}
          tintColor={theme.button}
          style={styles.segmentedControl}
          activeFontStyle={{ color: theme.buttontext }}
          fontStyle={{ color: theme.text }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  segmentedControl: {
    height: 45,
    overflow: "hidden",
    marginBottom: 50,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
});
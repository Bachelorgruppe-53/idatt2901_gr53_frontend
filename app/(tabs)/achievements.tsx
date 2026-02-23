import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Achievements from "@/src/components/unlockedAchievements";
import Careers from "@/src/components/unlockedCareers";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { BaseStyles } from "@/src/constants/Styles";


/**
 * This screen allows users to toggle between viewing unlocked careers and achievements.
 *
 * @returns JSX.Element
 */

export default function AchievementScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  return (
    <SafeAreaView
      style={[BaseStyles.flex, { backgroundColor: theme.background }]}
    >
      <View style={BaseStyles.flex}>
        {selectedIndex === 0 ? <Careers /> : <Achievements />}
      </View>

      <View style={themedStyles.segmentedView}>
        <SegmentedControl
          values={["Karrierer", "Merker"]}
          selectedIndex={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
          }}
          tintColor={theme.button}
          style={themedStyles.segmentedControl}
          activeFontStyle={themedStyles.activeSegmentText}
          fontStyle={themedStyles.segmentText}
        />
      </View>
    </SafeAreaView>
  );
}


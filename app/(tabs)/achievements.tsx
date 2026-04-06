import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Careers from "@/src/components/careers/unlockedCareers";
import Achievements from "@/src/components/unlockedAchievements";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";

/**
 * This screen allows users to toggle between viewing unlocked careers and achievements.
 *
 * @returns JSX.Element
 */

export default function AchievementScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("navbar");

  return (
    <SafeAreaView
      style={[BaseStyles.flex, { backgroundColor: theme.background }]}
    >
      <View style={BaseStyles.flex}>
        {selectedIndex === 0 ? <Careers /> : <Achievements />}
      </View>

      <View style={themedStyles.segmentedView}>
        <SegmentedControl
          values={[t("careersSegment"), t("badgesSegment")]}
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

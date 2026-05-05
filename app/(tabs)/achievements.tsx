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
 * This component renders the Achievements screen, which includes a segmented control for switching between unlocked careers and badges.
 * It uses the useState hook to manage the selected segment index and conditionally renders either the Careers or Achievements component based on the selected index.
 * Note: The actual content of the Careers and Achievements components is not implemented in this file and is imported from separate modules.
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

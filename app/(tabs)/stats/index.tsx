import CityScoreboard from "@/src/components/stats/cityWideScoreboard";
import ClassScoreboard from "@/src/components/stats/classWideScoreboard";
import SchoolScoreboard from "@/src/components/stats/schoolWideScoreboard";
import { BaseStyles } from "@/src/constants/Styles";
import { useThemedStyles } from "@/src/hooks/useStyleSheet";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * This component renders the stats screen, which includes a segmented control for switching between different scoreboards (class, school, city).
 * @returns JSX.Element
 */

export default function StatsScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("stats");

  return (
    <View style={BaseStyles.flex}>
      <SafeAreaView style={themedStyles.backgroundFlex}>
        <View style={BaseStyles.flex}>
          {selectedIndex === 0 ? (
            <ClassScoreboard />
          ) : selectedIndex === 1 ? (
            <SchoolScoreboard />
          ) : (
            <CityScoreboard />
          )}
        </View>

        <View style={themedStyles.segmentedView}>
          <SegmentedControl
            values={[
              t("classScoreboard"),
              t("schoolScoreboard"),
              t("cityScoreboard"),
            ]}
            selectedIndex={selectedIndex}
            onChange={(event) => {
              setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
            }}
            tintColor={theme.button}
            style={themedStyles.segmentedControl}
            activeFontStyle={{ color: theme.buttontext }}
            fontStyle={{ color: theme.text }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

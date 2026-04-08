import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import { BaseStyles } from "@/src/constants/Styles";
import { useTranslation } from "react-i18next";

interface Area {
  id: string;
  name?: string;
  label?: string;
  value: string | null;
}

interface AreaSelectorProps {
  areas: Area[];
  selectedArea: string | null;
  onAreaChange: (value: string | null) => void;
}

export const AreaSelector = ({
  areas,
  selectedArea,
  onAreaChange,
}: AreaSelectorProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("map");

  const handleSelect = useCallback(
    (value: string | null) => {
      onAreaChange(value);
      setDropdownOpen(false);
    },
    [onAreaChange],
  );

  const selectedAreaLabel =
    areas.find((a) => a.value === selectedArea)?.label ||
    areas.find((a) => a.value === selectedArea)?.name ||
    "Select Area";

  return (
    <View style={styles.dropdownContainer}>
      <Pressable
        style={themedStyles.dropdownButton}
        onPress={() => setDropdownOpen(!dropdownOpen)}
        accessibilityLabel={t("toggleAreaDropdown")}
      >
        <Text style={themedStyles.dropdownButtonText}>{selectedAreaLabel}</Text>
        <Text style={themedStyles.text}>▼</Text>
      </Pressable>

      {dropdownOpen && (
        <View style={themedStyles.dropdownMenu}>
          <ScrollView nestedScrollEnabled>
            {areas.map((area) => (
              <Pressable
                key={area.id}
                style={[
                  themedStyles.dropdownItem,
                  selectedArea === area.value && themedStyles.dropdownItemActive,
                ]}
                onPress={() => handleSelect(area.value)}
              >
                <Text
                  style={themedStyles.semiboldText}
                >
                  {area.label || area.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 100,
  },
});
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useThemedStyles } from "../../hooks/useStyleSheet";

/**
 * Props for the AreaSelector component.
 * - `areas`: An array of area objects, each containing an `id`, optional `name` and `label`, and a `value`.
 * - `selectedArea`: The currently selected area value, which can be null if no area is selected.
 * - `onAreaChange`: A callback function that is called when the user selects a different area. It receives the new area value as an argument.
 *
 * This component renders a dropdown menu that allows users to select an area from a list. The dropdown displays the currently selected area and toggles the visibility of the options when pressed. When an option is selected, it calls the `onAreaChange` callback with the new value and closes the dropdown.
 *
 * @returns JSX.Element
 */

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
  onAreaReselect?: (value: string | null) => void;
}

/**
 * AreaSelector component that renders a dropdown menu for selecting an area. 
 * It displays the currently selected area and allows the user to choose from a list of areas. 
 * When an area is selected, it triggers the onAreaChange callback with the new value. 
 * If the user selects the already selected area, it can optionally trigger the onAreaReselect callback.
 * @param param0 The props for the AreaSelector component, including the list of areas, the currently selected area, and the callbacks for area change and reselection.
 * @returns JSX.Element
 */
export const AreaSelector = ({
  areas,
  selectedArea,
  onAreaChange,
  onAreaReselect,
}: AreaSelectorProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("map");

  const handleSelect = useCallback(
    (value: string | null) => {
      if (value === selectedArea) {
        onAreaReselect?.(value);
      }
      onAreaChange(value);
      setDropdownOpen(false);
    },
    [onAreaChange, onAreaReselect, selectedArea],
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
                  selectedArea === area.value &&
                    themedStyles.dropdownItemActive,
                ]}
                onPress={() => handleSelect(area.value)}
              >
                <Text style={themedStyles.semiboldText}>
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

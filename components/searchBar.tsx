import { MaterialIcons } from "@expo/vector-icons";
import { TextInput, View } from "react-native";
import { Colors } from "../src/constants/Colors";
import { useThemedStyles } from "../src/hooks/useStyleSheet";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search",
  accessibilityLabel = "Search input",
  accessibilityHint = "Type to filter results",
}: SearchBarProps) {
  const themedStyles = useThemedStyles();

  return (
    <View style={{ width: "100%", paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={{ position: "relative", width: "100%" }}>
        <MaterialIcons
          name="search"
          size={22}
          color={Colors.brand.gray}
          accessible={false}
          importantForAccessibility="no"
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            marginTop: -11,
            zIndex: 1,
          }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.brand.gray}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="search"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          allowFontScaling={true}
          maxFontSizeMultiplier={2}
          style={{
            width: "100%",
            minHeight: 48,
            borderWidth: 2,
            borderColor: Colors.brand.gray,
            borderRadius: 12,
            paddingLeft: 44,
            paddingRight: 16,
            paddingVertical: 12,
            color: themedStyles.text?.color || Colors.brand.black,
            backgroundColor: Colors.brand.white,
          }}
        />
      </View>
    </View>
  );
}

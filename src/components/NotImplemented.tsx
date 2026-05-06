import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";
import { useTranslation } from "react-i18next";

interface NotImplementedProps {
  title?: string;
}

/**
 * NotImplemented component that displays a placeholder message and icon for features that are not yet implemented.
 * @param param0 An object containing an optional title to display above the placeholder message. If no title is provided, it defaults to "Coming Soon".
 * @returns A JSX element representing the not implemented placeholder, which includes an icon, a title, and a message indicating that the feature is not yet available.
 */
export function NotImplemented({ title = "Coming Soon" }: NotImplementedProps) {
  const themedStyles = useThemedStyles();
  const { t } = useTranslation("settings");

  return (
    <View style={[themedStyles.container, BaseStyles.center]}>
      <MaterialIcons
        name="upcoming"
        size={64}
        color={themedStyles.text.color}
      />
      <Text style={[themedStyles.modalTitle, { marginVertical: 8 }]}>{title}</Text>
      <Text style={themedStyles.text}>
        {t("notImplemented")}
      </Text>
    </View>
  );
}

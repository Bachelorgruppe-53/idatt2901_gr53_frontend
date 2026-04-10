import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";
import { useTranslation } from "react-i18next";

interface NotImplementedProps {
  title?: string;
}

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

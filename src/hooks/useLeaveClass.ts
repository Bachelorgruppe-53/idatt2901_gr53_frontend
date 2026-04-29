import { getApiBaseUrl } from "@/services/apiConfig";
import { ensureUserId } from "@/services/authService";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

export const useLeaveClass = (onLeft?: () => void) => {
  const { t } = useTranslation("settings");

  const leaveClass = () => {
    Alert.alert(
      t("leaveClass", "Leave class"),
      t("leaveClassConfirm", "Are you sure you want to leave your current class?"),
      [
        { text: t("cancel", "Cancel"), style: "cancel" },
        {
          text: t("leaveClass", "Leave class"),
          style: "destructive",
          onPress: async () => {
            try {
              const userId = await ensureUserId();
              const baseUrl = getApiBaseUrl().replace(/\/$/, "");

              await axios.put(
                `${baseUrl}/user/leave`,
                {},
                { headers: { "X-User-ID": userId } },
              );

              Alert.alert(t("leftClass", "You have left the class"));
              onLeft?.();
            } catch (error) {
              console.error("Failed to leave class:", error);
              Alert.alert(
                t("error", "Error"),
                t("leaveClassError", "Failed to leave class. Please try again."),
              );
            }
          },
        },
      ],
    );
  };

  return { leaveClass };
};
import { NotImplemented } from "@/src/components/NotImplemented";
import { useTranslation } from "react-i18next";

/**
 * This component renders a screen for managing notification settings.
 * Note: The actual functionality for managing notification settings is not implemented and is represented by a placeholder component.
 * @returns JSX.Element
 */

export default function NotificationSettings() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("notificationSettings")} />;
}

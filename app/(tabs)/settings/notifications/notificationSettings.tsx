import { NotImplemented } from "@/src/components/NotImplemented";
import { useTranslation } from "react-i18next";

export default function NotificationSettings() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("notificationSettings")} />;
}

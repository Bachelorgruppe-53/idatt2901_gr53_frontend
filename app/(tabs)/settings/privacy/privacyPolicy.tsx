import { NotImplemented } from "@/src/components/NotImplemented";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("privacyPolicy")} />;
}

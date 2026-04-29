import { NotImplemented } from "./NotImplemented";
import { useTranslation } from "react-i18next";

export default function Achievements() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("achievements")} />;
}

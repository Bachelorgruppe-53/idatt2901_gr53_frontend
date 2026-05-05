import { NotImplemented } from "./NotImplemented";
import { useTranslation } from "react-i18next";

/**
 * Achievements component that serves as a placeholder for the achievements feature in the app. 
 * It displays a "Coming Soon" message and an icon to indicate that the feature is not yet implemented.
 * @returns JSX.Element
 */
export default function Achievements() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("achievements")} />;
}

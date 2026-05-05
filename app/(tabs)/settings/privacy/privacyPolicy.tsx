import { NotImplemented } from "@/src/components/NotImplemented";
import { useTranslation } from "react-i18next";

/**
 * This component renders a screen for displaying the app's privacy policy.
 * Note: The actual content of the privacy policy is not implemented and is represented by a placeholder component.
 * @returns JSX.Element
 */

export default function PrivacyPolicy() {
  const { t } = useTranslation("settings");
  return <NotImplemented title={t("privacyPolicy")} />;
}

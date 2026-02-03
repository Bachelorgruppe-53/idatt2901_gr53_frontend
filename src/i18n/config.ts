import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translation files
import enAuth from "./locales/en-US/auth.json";
import enCommon from "./locales/en-US/common.json";
import enHome from "./locales/en-US/home.json";
import enNavbar from "./locales/en-US/navbar.json";
import enSettings from "./locales/en-US/settings.json";

import nbAuth from "./locales/no-NB/auth.json";
import nbCommon from "./locales/no-NB/common.json";
import nbHome from "./locales/no-NB/home.json";
import nbNavbar from "./locales/no-NB/navbar.json";
import nbSettings from "./locales/no-NB/settings.json";

import nnAuth from "./locales/no-NN/auth.json";
import nnCommon from "./locales/no-NN/common.json";
import nnHome from "./locales/no-NN/home.json";
import nnNavbar from "./locales/no-NN/navbar.json";
import nnSettings from "./locales/no-NN/settings.json";

const deviceLanguage = Localization.getLocales()[0]?.languageTag || "en-US";

const getSupportedLanguage = (deviceLang: string): string => {
  // Check for exact match
  if (["en-US", "no-NB", "no-NN"].includes(deviceLang)) {
    return deviceLang;
  }

  // Check for language code match (e.g., "no" -> "no-NB")
  const languageCode = deviceLang.split("-")[0];
  if (languageCode === "no" || languageCode === "nb") {
    return "no-NB";
  }
  if (languageCode === "nn") {
    return "no-NN";
  }
  if (languageCode === "en") {
    return "en-US";
  }

  // Default fallback
  return "en-US";
};

// Configure i18n
i18n.use(initReactI18next).init({
  resources: {
    "en-US": {
      common: enCommon,
      auth: enAuth,
      navbar: enNavbar,
      settings: enSettings,
      home: enHome,
    },
    "no-NB": {
      common: nbCommon,
      auth: nbAuth,
      navbar: nbNavbar,
      settings: nbSettings,
      home: nbHome,
    },
    "no-NN": {
      common: nnCommon,
      auth: nnAuth,
      navbar: nnNavbar,
      settings: nnSettings,
      home: nnHome,
    },
  },
  lng: getSupportedLanguage(deviceLanguage),
  fallbackLng: "en-US",
  ns: ["common", "auth", "navbar", "settings", "home"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

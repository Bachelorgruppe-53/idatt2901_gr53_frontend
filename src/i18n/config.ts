import { getLanguagePreference } from "@/services/utils/secureStorage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import your translation files
import enAboutCarrer from "./locales/en-US/aboutCareer.json";
import enAuth from "./locales/en-US/auth.json";
import enClass from "./locales/en-US/class.json";
import enCommon from "./locales/en-US/common.json";
import enHome from "./locales/en-US/home.json";
import enNavbar from "./locales/en-US/navbar.json";
import enQuiz from "./locales/en-US/quiz.json";
import enSettings from "./locales/en-US/settings.json";
import enStats from "./locales/en-US/stats.json";

import nbAboutCarrer from "./locales/no-NB/aboutCareer.json";
import nbAuth from "./locales/no-NB/auth.json";
import nbClass from "./locales/no-NB/class.json";
import nbCommon from "./locales/no-NB/common.json";
import nbHome from "./locales/no-NB/home.json";
import nbNavbar from "./locales/no-NB/navbar.json";
import nbQuiz from "./locales/no-NB/quiz.json";
import nbSettings from "./locales/no-NB/settings.json";
import nbStats from "./locales/no-NB/stats.json";

import nnAboutCarrer from "./locales/no-NN/aboutCareer.json";
import nnAuth from "./locales/no-NN/auth.json";
import nnClass from "./locales/no-NN/class.json";
import nnCommon from "./locales/no-NN/common.json";
import nnHome from "./locales/no-NN/home.json";
import nnNavbar from "./locales/no-NN/navbar.json";
import nnQuiz from "./locales/no-NN/quiz.json";
import nnSettings from "./locales/no-NN/settings.json";
import nnStats from "./locales/no-NN/stats.json";

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
const i18nInitPromise = i18n.use(initReactI18next).init({
  resources: {
    "en-US": {
      common: enCommon,
      auth: enAuth,
      navbar: enNavbar,
      settings: enSettings,
      home: enHome,
      aboutCareer: enAboutCarrer,
      stats: enStats,
      class: enClass,
      quiz: enQuiz,
    },
    "no-NB": {
      common: nbCommon,
      auth: nbAuth,
      navbar: nbNavbar,
      settings: nbSettings,
      home: nbHome,
      aboutCareer: nbAboutCarrer,
      stats: nbStats,
      class: nbClass,
      quiz: nbQuiz,
    },
    "no-NN": {
      common: nnCommon,
      auth: nnAuth,
      navbar: nnNavbar,
      settings: nnSettings,
      home: nnHome,
      aboutCareer: nnAboutCarrer,
      stats: nnStats,
      class: nnClass,
      quiz: nnQuiz,
    },
  },
  lng: getSupportedLanguage(deviceLanguage),
  fallbackLng: "en-US",
  ns: [
    "common",
    "auth",
    "navbar",
    "settings",
    "home",
    "aboutCareer",
    "stats",
    "class",
    "quiz"
  ],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

void (async () => {
  await i18nInitPromise;
  const savedLanguage = await getLanguagePreference();
  if (!savedLanguage) {
    return;
  }

  const supportedLanguage = getSupportedLanguage(savedLanguage);
  if (i18n.language !== supportedLanguage) {
    await i18n.changeLanguage(supportedLanguage);
  }
})();

export default i18n;

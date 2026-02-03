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

// Configure i18n
i18n
  .use(initReactI18next) // Pass i18next instance to react-i18next
  .init({
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
    lng: "no-NN", // default language
    fallbackLng: "no-NN", // fallback if translation is missing
    ns: ["common", "auth", "navbar", "settings", "home"], // available namespaces
    defaultNS: "common", // default namespace
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;

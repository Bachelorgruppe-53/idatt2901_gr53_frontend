import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import en from "./locales/en-US/common.json";
import noNB from "./locales/no-NB/common.json";
import noNN from "./locales/no-NN/common.json";

const i18n = new I18n({
  en,
  noNB,
  noNN,
});

// Device locale (e.g. "en-US" → "en")
i18n.locale = Localization.getLocales()[0]?.languageTag ?? "en";

// Fallback if key or language is missing
i18n.enableFallback = true;

// Optional: force language during dev
// i18n.locale = 'en';

export default i18n;

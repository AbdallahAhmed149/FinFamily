import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const RTL_LANGUAGES = ["ar"];
export const SUPPORTED_LANGUAGES = ["en", "ar"];
export const DEFAULT_LANGUAGE = "en";

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem("ff-lang");
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
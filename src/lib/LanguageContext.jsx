import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { RTL_LANGUAGES, SUPPORTED_LANGUAGES } from "@/i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language);

  const isRTL = RTL_LANGUAGES.includes(language);

  const applyToDocument = useCallback((lang) => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
  }, []);

  const setLanguage = useCallback(
    (lang) => {
      if (!SUPPORTED_LANGUAGES.includes(lang) || lang === language) return;

      // التبديل الفعلي: النصوص + اتجاه الصفحة (dir) + حفظ الاختيار
      const commit = () => {
        i18n.changeLanguage(lang);
        setLanguageState(lang);
        applyToDocument(lang);
        try {
          localStorage.setItem("ff-lang", lang);
        } catch {
          /* ignore */
        }
      };

      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // 1) المتصفحات اللي بتدعم View Transitions (Chrome / Edge / Safari 18+):
      //    بياخد "صورة" للصفحة القديمة ويعمل cross-fade للجديدة. flushSync ضروري
      //    عشان React يحدّث الـ DOM بالكامل قبل ما المتصفح ياخد صورة الصفحة الجديدة.
      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(() => {
          flushSync(commit);
        });
        return;
      }

      // 2) المستخدم مفعّل "تقليل الحركة" في جهازه: نبدّل فورًا من غير أنيميشن
      if (reduceMotion) {
        commit();
        return;
      }

      // 3) Fallback للمتصفحات القديمة (Firefox مثلًا): fade-out → تبديل → fade-in
      const root = document.getElementById("root");
      if (!root) {
        commit();
        return;
      }
      root.style.transition = "opacity 160ms ease";
      root.style.opacity = "0";
      setTimeout(() => {
        commit();
        requestAnimationFrame(() => {
          root.style.opacity = "1";
          setTimeout(() => {
            root.style.transition = "";
            root.style.opacity = "";
          }, 200);
        });
      }, 160);
    },
    [i18n, language, applyToDocument]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "ar" ? "en" : "ar");
  }, [language, setLanguage]);

  // اطبّق الاتجاه واللغة على أول تحميل للصفحة
  useEffect(() => {
    applyToDocument(language);
  }, [applyToDocument, language]);

  return (
    <LanguageContext.Provider value={{ language, isRTL, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
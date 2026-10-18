import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { contentAr } from "@/i18n/content";

/**
 * بيرجع دالة tc(text) بتترجم نصوص finData.js (عناوين/أوصاف/أسئلة الألعاب...)
 * للعربي لما اللغة الحالية عربي، وترجع النص زي ما هو لو مفيش ترجمة متاحة أو
 * اللغة إنجليزي. البيانات نفسها في finData.js فضلت إنجليزي عشان أي منطق
 * بيقارن بالقيمة دي (زي difficulty أو category) يفضل شغال صح.
 */
export function useContentTranslation() {
  const { i18n } = useTranslation();
  const tc = useCallback(
    (text) => (i18n.language === "ar" && contentAr[text] ? contentAr[text] : text),
    [i18n.language]
  );
  return tc;
}
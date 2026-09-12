import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function LanguageToggle({ className = '' }) {
  const { language, toggleLanguage } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-sm font-medium ${className}`}
      title={isArabic ? 'Switch to English' : 'التبديل للعربية'}
    >
      <span className="text-base">{isArabic ? '🇺🇸' : '🇪🇬'}</span>
      <span>{isArabic ? 'EN' : 'عربي'}</span>
    </button>
  );
}

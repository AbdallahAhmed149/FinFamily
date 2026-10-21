import React from "react";
import { useTranslation } from "react-i18next";
import { TITLES, nameOf } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";

// اللقب المفعّل جنب اسم الطفل (من متجر الجواهر).
export default function TitleBadge({ title, className }) {
  const { i18n } = useTranslation();
  const info = title ? TITLES[title] : null;
  if (!info) return null;
  return (
    <span data-testid="title-badge" className={cn("inline-flex items-center gap-1 rounded-full bg-amber-400/20 text-amber-600 text-[11px] font-bold px-2.5 py-0.5", className)}>
      {info.emoji} {nameOf(info.name, i18n.language)}
    </span>
  );
}
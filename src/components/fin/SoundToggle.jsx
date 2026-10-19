import React, { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, subscribeMuted, play } from "@/lib/sounds";

export default function SoundToggle({ className = "" }) {
  const { t } = useTranslation();
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  const toggle = () => {
    const next = !muted;
    setMuted(next);
    if (!next) play("tap"); // لما الطفل يفتح الصوت يسمع إنه اشتغل
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? t("celebration.soundOn") : t("celebration.soundOff")}
      aria-pressed={muted}
      className={"w-9 h-9 rounded-full glass flex items-center justify-center active:scale-95 transition-all " + className}
    >
      {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
    </button>
  );
}
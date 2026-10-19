import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { levels } from "@/lib/finData";
import { useContentTranslation } from "@/lib/useContentTranslation";
import { play } from "@/lib/sounds";
import { bigCelebration } from "@/lib/celebrate";

export default function LevelUpScreen({ level, onClose }) {
  const { t } = useTranslation();
  const tc = useContentTranslation();
  const info = levels.find((l) => l.level === level) || levels[levels.length - 1];
  const next = levels.find((l) => l.level === level + 1);

  useEffect(() => {
    play("levelUp");
    bigCelebration();
  }, []);

  const close = () => { play("tap"); onClose(); };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={t("celebration.levelUp.title")}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6 text-center text-white overflow-hidden"
      style={{ background: `radial-gradient(circle at 50% 35%, ${info.color}, #0F2D52 70%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="w-40 h-40 rounded-full bg-white/15 border-4 border-white/40 flex flex-col items-center justify-center shadow-2xl"
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12, delay: 0.1 }}
      >
        <div className="text-xs font-bold tracking-widest opacity-80">{t("celebration.levelUp.level")}</div>
        <div className="text-7xl font-extrabold font-heading leading-none">{level}</div>
      </motion.div>

      <motion.h1
        className="mt-6 text-4xl font-extrabold font-heading"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        {t("celebration.levelUp.title")} 🎉
      </motion.h1>

      <motion.p
        className="mt-2 text-lg font-semibold"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {t("celebration.levelUp.nowA", { name: tc(info.name) })}
      </motion.p>

      {next && (
        <motion.p
          className="mt-1 text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {t("celebration.levelUp.next", { xp: next.minXp, name: tc(next.name) })}
        </motion.p>
      )}

      <motion.button
        onClick={close}
        className="mt-10 w-full max-w-xs h-14 rounded-2xl bg-white font-extrabold font-heading text-lg shadow-premium active:scale-[0.97] transition-transform"
        style={{ color: "#0F2D52" }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {t("celebration.levelUp.button")}
      </motion.button>
    </motion.div>
  );
}
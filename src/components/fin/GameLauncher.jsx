import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GameOverlay from "@/components/fin/GameOverlay";
import RewardScreen from "@/components/fin/RewardScreen";
import BudgetBuilder from "@/components/fin/games/BudgetBuilder";
import NeedsVsWants from "@/components/fin/games/NeedsVsWants";
import GuessPrice from "@/components/fin/games/GuessPrice";
import CoinCatcher from "@/components/fin/games/CoinCatcher";
import ChangeMaker from "@/components/fin/games/ChangeMaker";
import SmartShopper from "@/components/fin/games/SmartShopper";
import ScamDetective from "@/components/fin/games/ScamDetective";
import FutureInvestor from "@/components/fin/games/FutureInvestor";
import SavingHero from "@/components/fin/games/SavingHero";
import { completeGame } from "@/lib/finApi";
import { useAuth } from "@/lib/AuthContext";
import { useCelebrationHold } from "@/lib/CelebrationContext";
import { play } from "@/lib/sounds";

const registry = {
  gm2: BudgetBuilder, gm3: NeedsVsWants, gm4: GuessPrice,
  gm5: CoinCatcher, gm7: ChangeMaker,
  gm8: SmartShopper, gm9: ScamDetective, gm10: FutureInvestor, gm11: SavingHero,
};

export default function GameLauncher({ game, onClose }) {
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const G = registry[game.id] || SmartShopper;

  // طول ما اللعبة/شاشة المكافأة مفتوحة، شاشة Level-Up العامة تستنى (يشوف المكافأة الأول).
  useCelebrationHold(true);
  useEffect(() => { play("open"); }, []);

  // المكافأة بتتحدد في الباك اند بس (GAME_CATALOG) — احنا هنا بس بنبعت النتيجة
  // الخام (score/total) اللي اللعبة وصلتلها، وبنعرض اللي السيرفر يرجعه فعليًا.
  const handleFinish = async (score, total) => {
    setError(null);
    try {
      const res = await completeGame(game.id, score, total);
      setReward({
        score, total,
        gems: res.gems_awarded, xp: res.xp_awarded,
        alreadyToday: res.already_rewarded_today, leveledUp: res.leveled_up,
        newBadges: res.newly_unlocked_badges || [],
        perfectDayGems: res.perfect_day_bonus_gems, perfectDayXp: res.perfect_day_bonus_xp,
        streak: {
          freezeUsed: res.streak_freeze_used || 0,
          freezeEarned: !!res.streak_freeze_earned,
          lost: res.streak_lost || 0,
        },
      });
      // الجواهر 💎 بتتحدث في user (refreshUser) — والرصيد بيتحدث لوحده لأن Home/Profile بيجيبوا الـ wallet تاني كل ما تفتحهم،
      // لكن الـ xp/level/streak جايين من AuthContext.user اللي بيتحمّل مرة واحدة بس وقت
      // الدخول ومبيتحدثش لوحده — من غير الاستدعاء ده هيفضلوا قيمهم القديمة لحد ما الطفل
      // يعمل logout/login تاني، حتى لو الشاشة قدامه بتوري رقم XP جديد صح.
      refreshUser().catch(() => {}); // ميوقفش شاشة المكافأة لو الريفريش فشل لأي سبب
    } catch (err) {
      setError(err.message || t("games.gameLauncher.genericError"));
      // برضو نوري شاشة إنهاء (من غير مكافأة) عشان الطفل ميفضلش واقف
      setReward({ score, total, gems: 0, xp: 0, alreadyToday: false, leveledUp: false, newBadges: [], perfectDayGems: 0, perfectDayXp: 0, streak: null });
    }
  };

  const abort = () => { play("back"); onClose(false); };
  const complete = () => { setReward(null); onClose(true); };

  const noteLines = [];
  if (reward?.alreadyToday) noteLines.push(t("games.gameLauncher.alreadyToday"));
  if (reward?.perfectDayGems > 0) noteLines.push(t("games.gameLauncher.perfectDayBonus", { gems: reward.perfectDayGems, xp: reward.perfectDayXp }));
  if (!reward?.alreadyToday && error) noteLines.push(error);

  return (
    <GameOverlay title={game.title} icon={game.icon} onClose={abort}>
      {reward ? (
        <RewardScreen
          title={reward.newBadges?.length ? t("games.gameLauncher.badgeUnlocked") : reward.leveledUp ? t("games.gameLauncher.levelUp") : t("games.gameLauncher.missionComplete")}
          score={reward.score}
          total={reward.total}
          gems={reward.gems + (reward.perfectDayGems || 0)}
          xp={reward.xp + (reward.perfectDayXp || 0)}
          note={noteLines.length ? noteLines.join(" · ") : undefined}
          badges={reward.newBadges || []}
          streak={reward.streak || undefined}
          onClose={complete}
        />
      ) : (
        <G onFinish={handleFinish} onExit={abort} />
      )}
    </GameOverlay>
  );
}